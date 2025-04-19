import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { dummyInterviews } from "../../../constants";
import InterviewCard from "@/components/InterviewCard";
import { getCurentUser } from "@/lib/actions/auth.actions";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.actions";
const Page = async () => {
  const user = await getCurentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewsByUserId(user?.id!),
    await getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastIntervews = userInterviews && userInterviews.length > 0;
  const hasLatestInterviews = latestInterviews && latestInterviews.length > 0;

  console.log(userInterviews);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview Ready with AI Powered Practice & Feedback</h2>
          <p className="text-l">
            Practice real time interview questions & get instant feedback
          </p>
          <Button className="btn-primary max-sm:w-full" asChild>
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="hero"
          height={400}
          width={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastIntervews ? (
            userInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven't taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>
        {hasLatestInterviews ? (
          latestInterviews.map((interview) => (
            <InterviewCard {...interview} key={interview.id} />
          ))
        ) : (
          <p>There are no new interviews yet</p>
        )}
        <div className="interviews-section"></div>
      </section>
    </>
  );
};

export default Page;
