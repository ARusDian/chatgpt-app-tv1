"use client"
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import OpenAI from 'openai';
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";


export default function quiz() {

    const [isRecording, setIsRecording] = useState(false);

    const separator = ["\n", ".", "?", "!", ". ", "? ", "! "]

    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });

    const [quests, setQuests] = useState([]);
    const [currQuest, setCurrQuest] = useState("");

    useEffect(() => {
        generateQuestion();
    }, [])

   
    const generateQuestion = async () => {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'generate one question that commonly used in IELTS' }],
            model: 'gpt-3.5-turbo',
          });
        
        console.log(completion);
    }
    

    const startRecording = () => {
        setIsRecording(!isRecording); 
    }

    return (
      <main className="flex w-[100vw] h-[100vh] flex-col px-20 py-12 gap-10">

        <section className="w-[100%] h-[90%] mx-auto flex justify-center items-center flex-col">
            <h1 className="text-4xl text-center max-w-[1000px]">{currQuest}</h1>

            <button type="button" className="mt-20 text-white  hover:bg-blue-200 border border-blue-300 text-blue-400 focus:ring-4 focus:ring-blue-200 font-medium text-sm w-64 h-64 border rounded-full mr-2 mb-2"
            onClick={startRecording}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="Mic" className="w-36 mx-auto mb-5"><path d="M12,15a4,4,0,0,0,4-4V5A4,4,0,0,0,8,5v6A4,4,0,0,0,12,15ZM10,5a2,2,0,0,1,4,0v6a2,2,0,0,1-4,0Zm10,6a1,1,0,0,0-2,0A6,6,0,0,1,6,11a1,1,0,0,0-2,0,8,8,0,0,0,7,7.93V21H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2H13V18.93A8,8,0,0,0,20,11Z" fill="#4da5cb" className="color000000 svgShape"></path></svg>

                <span>
                    {isRecording ? "Stop Recording..." : "Start Recording"}
                </span>
            </button>

        </section>
        

        <section className="flex justify-between items-start">
            <button type="button" className="text-blue-700 bg-white hover:bg-blue-200 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2 border border-blue-700">Back</button>

            <div>
                {Array.from({ length: 10 }, (_, i) => (
                    <button
                    onClick={generateQuestion}
                    key={i + 1}
                    type="button"
                    className={`text-blue-400 hover:bg-blue-200 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 border border-blue-200`}
                    >
                    {i + 1}
                    </button>
                ))}
            </div>


            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2">Next</button>

        </section>
      </main>
    )
}
