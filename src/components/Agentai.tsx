"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
}

interface savedMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const Agentai = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<savedMessage[]>([]);
  const [IsSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeekStart = () => {
      setIsSpeaking(true);
    };
    const onSpeekEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeekStart);
    vapi.on("speech-end", onSpeekEnd);
    vapi.on("error", onError);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeekStart);
      vapi.off("speech-end", onSpeekEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      router.push("/");
    }
  }, [messages, callStatus, type, userId]);


  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
      variableValues: {
        userid: userId,
        username: userName,
      },
    });
  }

    const handleDisconnect = async () => {
      setCallStatus(CallStatus.FINISHED);
      await vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinsihed =
      callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interview">
          <div className="avatar">
            <Image
              src="./ai-avatar.png"
              alt="vapi"
              height={54}
              width={65}
              className="object-cover"
            />
            {IsSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3>AI Interview</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="./user-avatar.png"
              alt="user-avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            {userName}
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcription-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0 ",
                "animate-fadeIn opacity-100 "
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden")
              }
            />
            <span>
              {isCallInactiveOrFinsihed
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>End</button>
        )}
      </div>
    </>
  );
};

export default Agentai;
