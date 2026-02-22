import connectDB from "@/lib/db";
import Image from "next/image";

export default function Home() {
  connectDB();
  return (
    <div>
      <h1 className="font-bold text-3xl underline">Hello world!</h1>
    </div>
  );
}
