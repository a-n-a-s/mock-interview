import Agentai from "@/components/Agentai";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getCurentUser } from "@/lib/actions/auth.actions";
import { getInterviewById } from "@/lib/actions/general.actions";
import { getRandomInterviewCover } from "@/lib/utils";

import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;

  const interview = await getInterviewById(id);
  const user = await getCurentUser();


  if (!interview) redirect("/");

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex lfex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview?.role}</h3>
          </div>
          <DisplayTechIcons techStack={interview?.techstack} />
        </div>
        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">
          {interview?.type}
        </p>
      </div>
      <Agentai 
        userName={user?.name ?? ''} 
        userId={user?.id ?? ''} 
        interviewId={id} 
        type="interview" 
        questions={interview.questions}  
      />
    </>
  );
};

export default Page;
