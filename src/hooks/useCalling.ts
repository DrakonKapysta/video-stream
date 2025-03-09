import { useCallingStore } from "@/store/callingStore";
import { CallerInfo } from "@/types/SocketTypes";

const useCalling = (): {
  isCalling: boolean;
  caller: CallerInfo | null;
  isInitiator: boolean;
  resetCaller: () => void;
  setIsCalling: (isCalling: boolean) => void;
  setCaller: (callee: CallerInfo | null) => void;
  setInitiator: (isInitiator: boolean) => void;
  accepted: (targetSocketId: string) => void;
} => {
  const isCalling = useCallingStore((state) => state.isCalling);
  const caller = useCallingStore((state) => state.caller);
  const resetCaller = useCallingStore((state) => state.resetCaller);
  const setIsCalling = useCallingStore((state) => state.setIsCalling);
  const setCaller = useCallingStore((state) => state.setCaller);
  const setInitiator = useCallingStore((state) => state.setInitiator);
  const isInitiator = useCallingStore((state) => state.isInitiator);
  const accepted = useCallingStore((state) => state.accepted);

  return {
    isCalling,
    caller,
    isInitiator,
    resetCaller,
    setIsCalling,
    setCaller,
    setInitiator,
    accepted,
  };
};

export default useCalling;
