
import { Hero } from "@/components/modules/home/Hero";
import Specialities from "@/components/modules/home/Specialties";
import Steps from "@/components/modules/home/Steps";
import Testimonials from "@/components/modules/home/Testimonials";
import TopRatedDoctors from "@/components/modules/home/TopRatedDoctors";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>AI-Powered Healthcare - Find Your Perfect Doctor</title>
        <meta
          name="description"
          content="Discover top-rated doctors tailored to your needs with our AI-powered healthcare platform. Get personalized recommendations and book appointments effortlessly."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Hero />
        <Specialities />
        <TopRatedDoctors />
        <Steps />
        <Testimonials />
      </main>
    </>
  );
}