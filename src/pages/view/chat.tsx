"use client"
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import OpenAI from 'openai';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';



export default function chat() {

    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });


    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const [quests, setQuests] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [newBubbleElement, setNewBubbleElement] = useState<any[]>([]);
 
    console.log(quests);
    console.log(answers);


    useEffect(() => {
        generateQuestion();
    }, [])


    useEffect(() => {
        if(!listening && answers.length > 0 && transcript !== "") {
            setAnswers([...answers, transcript])
        }
    }, [listening, answers, transcript])


    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [quests])

    
    const generateQuestion = async () => {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'generate one question that commonly used in IELTS without quotes marks' }],
            model: 'gpt-3.5-turbo',
        });
        
        const newQuestion: any = completion.choices[0].message.content;
        setQuests([...quests, newQuestion]);
    }

    
    
    const addBubbleChat = () => {
        generateQuestion();
        resetTranscript();
        const newElement = (
            <>
                <div 
                    className="bg-blue-400 px-6 py-5 text-lg text-white w-[50%] max-w-[500px]"
                    style={{ borderRadius: "50px", borderTopLeftRadius: 0, marginBottom: "5px" }}
                >
                    <p>{quests[quests.length - 1]}</p>
                </div>
                
                <div 
                    className="bg-blue-200 px-6 py-5 text-lg text-blue-400 min-w-[75px] max-w-[500px] ml-auto"
                    style={{ borderRadius: "50px", borderTopRightRadius: 0, marginBottom: "5px" }}
                >
                    {
                        transcript !== "" ? (<p className="text-end">{transcript}</p>) : (<p className="text-end">......</p>)
                    }
                </div>
            </>
        )

        setNewBubbleElement([...newBubbleElement, newElement])
    }
    



    return (
      <main className="flex w-[100vw] h-[100vh] flex-col px-20 py-12 gap-10">

        <section className="w-[100%] max-w-[1300px] h-[90%] mx-auto flex justify-center items-center flex-col relative">
            <div className="w-[100%] h-[100%] p-5 overflow-y-scroll flex flex-col gap-3" style={{ scrollbarWidth: "none", }} ref={scrollContainerRef}>

                {newBubbleElement}

                <div 
                    className="bg-blue-400 px-6 py-5 text-lg text-white w-[50%] max-w-[500px]"
                    style={{ borderRadius: "50px", borderTopLeftRadius: 0, marginBottom: "5px" }}
                    >
                    <p>{quests[quests.length - 1]}</p>
                </div>

                <div 
                    className="bg-blue-200 px-6 py-5 text-lg text-blue-400 min-w-[75px] max-w-[500px] ml-auto"
                    style={{ borderRadius: "50px", borderTopRightRadius: 0, marginBottom: "5px" }}
                    >
                    {
                        listening ? (<p className="text-end">{transcript}</p>) : (<p className="text-end">.....</p>)
                    }
                </div>
                
               
            </div>

            <div className="w-[2%] h-[100%] bg-white absolute right-0"></div>


            

        </section>

        <section className="flex justify-center items-start">
            <button type="button" className="text-red-700 bg-white hover:bg-red-200 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2 border border-red-700"
            onClick={() => {
                SpeechRecognition.stopListening();
                addBubbleChat();
            }}
            >Stop</button>


            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2"
             onClick={() => {
                SpeechRecognition.startListening({ language: "en-US", continuous: true  })
            }}
            >
                Start Recording
            </button>

        </section>
    
      </main>
    )
}
