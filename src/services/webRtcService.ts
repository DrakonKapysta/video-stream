import { Socket } from "socket.io-client";
import { socketService } from "./socketService";
type StreamChangeListener = (stream: MediaStream | null) => void;

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private mediaConstraints = { audio: true, video: true };

  private localStreamListeners: StreamChangeListener[] = [];
  private remoteStreamListeners: StreamChangeListener[] = [];

  // Add event listeners
  public addLocalStreamListener(listener: StreamChangeListener) {
    this.localStreamListeners.push(listener);
    // Immediately notify with current state
    listener(this.localStream);
  }

  public addRemoteStreamListener(listener: StreamChangeListener) {
    this.remoteStreamListeners.push(listener);
    listener(this.remoteStream);
  }

  public removeLocalStreamListener(listener: StreamChangeListener) {
    const index = this.localStreamListeners.indexOf(listener);
    if (index !== -1) {
      this.localStreamListeners.splice(index, 1);
    }
  }

  public removeRemoteStreamListener(listener: StreamChangeListener) {
    const index = this.remoteStreamListeners.indexOf(listener);
    if (index !== -1) {
      this.remoteStreamListeners.splice(index, 1);
    }
  }

  // Notify listeners about stream changes
  private notifyLocalStreamChange() {
    this.localStreamListeners.forEach((listener) => {
      listener(this.localStream);
    });
  }

  private notifyRemoteStreamChange() {
    this.remoteStreamListeners.forEach((listener) => {
      listener(this.remoteStream);
    });
  }

  // Update stream setters to notify listeners
  private setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    this.notifyLocalStreamChange();
  }

  private setRemoteStream(stream: MediaStream | null) {
    this.remoteStream = stream;
    this.notifyRemoteStreamChange();
  }

  public invite(targetSocketId: string) {
    const socket = socketService.getSocket();
    if (targetSocketId === socket?.id) return;
    if (this.peerConnection) {
      alert("You can't start a call because you already have one open!");
    } else {
      this.createPeerConnection();
      navigator.mediaDevices
        .getUserMedia(this.mediaConstraints)
        .then((Stream: MediaStream) => {
          this.setLocalStream(Stream);
          this.localStream
            ?.getTracks()
            .forEach((track: MediaStreamTrack) =>
              this.peerConnection?.addTrack(track, Stream)
            );
        })
        .catch(this.handleGetUserMediaError);
    }
  }
  //Maybe change to private
  public createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });
    this.peerConnection.onicecandidate =
      this.handleICECandidateEvent.bind(this);
    this.peerConnection.ontrack = this.handleTrackEvent.bind(this);
    this.peerConnection.onnegotiationneeded =
      this.handleNegotiationNeededEvent.bind(this);
    this.peerConnection.oniceconnectionstatechange =
      this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange =
      this.handleSignalingStateChangeEvent;
  }
  public handleICEConnectionStateChangeEvent() {
    switch (this.peerConnection?.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        this.closeVideoCall();
        break;
    }
  }
  public handleSignalingStateChangeEvent() {
    switch (this.peerConnection?.signalingState) {
      case "closed":
        this.closeVideoCall();
        break;
    }
  }

  private handleGetUserMediaError(event: Error) {
    switch (event.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone" +
            "were found."
        );
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + event.message);
        break;
    }

    this.closeVideoCall();
  }
  public closeVideoCall() {
    console.log(
      "Trying to close video call, peerConnection:",
      this.peerConnection
    );
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.onicegatheringstatechange = null;
      this.peerConnection.onnegotiationneeded = null;

      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach((track) => track.stop());
        this.setRemoteStream(null);
      }

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.setLocalStream(null);
      }

      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
  public async handleVideoAnswerMsg(msg: { sdp: RTCSessionDescriptionInit }) {
    const desc = new RTCSessionDescription(msg.sdp);
    await this.peerConnection?.setRemoteDescription(desc).catch(reportError);
  }

  public handleVideoOfferMsg(data: {
    sdp: RTCSessionDescriptionInit;
    targetSocketId: string;
  }) {
    this.createPeerConnection();
    const desc = new RTCSessionDescription(data.sdp);
    this.peerConnection
      ?.setRemoteDescription(desc)
      .then(() => {
        return navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      })
      .then((stream) => {
        stream
          .getTracks()
          .forEach((track) => this.peerConnection?.addTrack(track, stream));
        this.setLocalStream(stream);
      })
      .then(() => {
        return this.peerConnection?.createAnswer();
      })
      .then((answer) => {
        return this.peerConnection?.setLocalDescription(answer);
      })
      .then(async () => {
        const socket = socketService.getSocket();
        if (!socket) return;
        const firstUser = await socketService.findFirstUser(socket);
        if (!firstUser) return;
        socketService.getSocket()?.emit("newRTCCreateAnswer", {
          targetSocketId: firstUser.socketId,
          sdp: this.peerConnection?.localDescription,
          from: socket.id,
        });
      })
      .catch(this.handleGetUserMediaError);
  }
  public async handleNewICECandidateMsg(data: {
    candidate: RTCIceCandidate;
    targetSocketId: string;
  }) {
    if (!this.peerConnection) return;
    if (!this.peerConnection.remoteDescription) {
      console.warn("Remote description is null, delaying ICE candidate");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const candidate = new RTCIceCandidate(data.candidate);

    this.peerConnection?.addIceCandidate(candidate).catch(this.reportError);
  }

  public async handleICECandidateEvent(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      const socket = socketService.getSocket();
      if (!socket) return;
      const firstUser = await socketService.findFirstUser(socket);
      if (!firstUser) return;
      this.newICECandidate(event.candidate, firstUser.socketId);
    }
  }
  public handleTrackEvent(event: RTCTrackEvent) {
    this.setRemoteStream(event.streams[0]);
  }

  public handleNegotiationNeededEvent() {
    this.peerConnection
      ?.createOffer()
      .then((offer) => {
        return this.peerConnection?.setLocalDescription(offer);
      })
      .then(async () => {
        const socket = socketService.getSocket();
        if (!socket) return;
        const firstUser = await socketService.findFirstUser(socket);
        if (!firstUser) return;

        socket?.emit("newRTCCreateOffer", {
          targetSocketId: firstUser.socketId,
          sdp: this.peerConnection?.localDescription,
          from: socket.id,
        });
      })
      .catch(this.reportError);
  }
  public newICECandidate = (
    candidate: RTCIceCandidate,
    targetSocketId: string
  ) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("newICECandidate", {
        candidate,
        targetSocketId,
        from: socket.id,
      });
    }
  };
  private reportError(error: Error) {
    alert(error.message);
  }

  get getLocalStream() {
    return this.localStream;
  }
  get getRemoteStream() {
    return this.remoteStream;
  }
}
export default new WebRTCService();
