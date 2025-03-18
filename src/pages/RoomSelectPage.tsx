import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoomStore } from "@/store/roomStore";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { FormRoomInfo } from "@/types/SocketTypes";

export const RoomSelectPage = () => {
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const createRoom = useRoomStore((state) => state.createRoom);
  const roomId = useRoomStore((state) => state.roomId);
  const isRoomLoading = useRoomStore((state) => state.isgRoomLoading);
  const isRoomConnected = useRoomStore((state) => state.isRoomConnected);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormRoomInfo>({
    defaultValues: {
      roomName: "",
      userName: "",
    },
  });
  useEffect(() => {
    if (isRoomConnected) {
      navigate(`/room/${roomId}`);
    }
  }, [isRoomConnected]);
  const onJoinRoom = async (data: FormRoomInfo) => {
    joinRoom(data);
  };

  const onCreateRoom = async (data: FormRoomInfo) => {
    createRoom(data);
  };

  const showLoader = isRoomLoading || isRoomConnected;

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold max-w-2xs text-center mb-2">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create/Join Room
          </span>
        </h2>
        <form className=" rounded-md ring-1 shadow-lg max-w-[400px] p-4 w-full">
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              {...register("userName")}
              placeholder="Enter your nickname"
            />
            {errors.roomName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.roomName.message}
              </p>
            )}
            <Input
              type="text"
              {...register("roomName")}
              placeholder="Enter room name"
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4 w-full ">
            <Button className="min-w-[30%]" onClick={handleSubmit(onJoinRoom)}>
              Join
            </Button>
            <Button className="w-full" onClick={handleSubmit(onCreateRoom)}>
              Create Room
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
