"use client"
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import OpenAI from 'openai';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";



export default function index() {

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

    const [chatLogs, setChatLogs] = useState<CreateChatCompletionRequestMessage[]>([]);

    const [isStart, setIsStart] = useState<boolean>(false);

    useEffect(() => {
        if (isStart) {
            generateQuestion();
        }
    }, [isStart])

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [JSON.stringify(chatLogs)])

    useEffect(() => {
        if (!listening && chatLogs.length > 0) {
            generateQuestion();
        }
    }, [listening])

    const generateQuestion = async () => {
        const prompt = {
            role: "assistant", content: transcript !== "" ?
                `generate one question without quotes marks according to to response statement : ${transcript}` :
                "generate one question that commonly used in IELTS without quotes marks"
        } as CreateChatCompletionRequestMessage

        const completion = await openai.chat.completions.create({
            messages: [...chatLogs, prompt],
            model: 'gpt-3.5-turbo',
        });

        const newQuestion = completion.choices[0].message.content;

        if (chatLogs.length > 0) {
            setChatLogs([...chatLogs, { role: "user", content: transcript }, { role: "assistant", content: newQuestion }])
        } else {
            setChatLogs([...chatLogs, { role: "assistant", content: newQuestion }])
        }

        fetch("api/synthesize-single", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: completion.choices[0].message.content,
            }),
        }).then((res) => res.json()).then(
            (data) => {
                const audio = document.getElementById("MyAudio") as HTMLAudioElement;
                audio?.removeAttribute('src');
                audio.src = data.src;
                audio.play();
            }
        )

        resetTranscript();

    }


    return (
        <main className="flex w-[100vw] h-[100vh] flex-col px-20 py-12 gap-10">
            {
                isStart ? (
                    <>
                        <section className="w-[100%] max-w-[1300px] h-[90%] mx-auto flex justify-center items-center flex-col relative rounded-3xl shadow-2xl shadow-sky-400/50">
                            <div className="w-[100%] h-[100%] p-5 overflow-y-scroll flex flex-col gap-3" style={{ scrollbarWidth: "none", }} ref={scrollContainerRef}>

                                {chatLogs.map((chat, index) => (
                                    <div key={index}>
                                        {chat.role === "assistant" ? (
                                            <div
                                                className="bg-blue-400 px-6 py-5 text-lg text-white w-[50%] max-w-[500px]"
                                                style={{ borderRadius: "50px", borderTopLeftRadius: 0, marginBottom: "5px" }}
                                            >
                                                <p>{chat.content}</p>
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-blue-200 px-6 py-5 text-lg text-blue-400 min-w-[75px] max-w-[500px] ml-auto"
                                                style={{ borderRadius: "50px", borderTopRightRadius: 0, marginBottom: "5px" }}
                                            >
                                                {
                                                    <p className="text-end">{chat.content}</p>
                                                }
                                            </div>
                                        )}
                                    </div >
                                ))}
                                {listening && (
                                    <div
                                        className="bg-blue-200 px-6 py-5 text-lg text-blue-400 min-w-[75px] max-w-[500px] ml-auto"
                                        style={{ borderRadius: "50px", borderTopRightRadius: 0, marginBottom: "5px" }}
                                    >
                                        {
                                            listening ? (<p className="text-end">{transcript}</p>) : (<p className="text-end">.....</p>)
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="w-[2%] h-[100%] bg-white absolute right-0"></div>


                        </section>

                        <section className="flex justify-center items-start">
                            <button
                                type="button"
                                className={`text-red-700 bg-white focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2 border border-red-700 ${!listening ? "" : "hover:bg-red-200"}`}
                                onClick={() => {
                                    SpeechRecognition.stopListening();
                                }}
                            >Stop</button>


                            <button
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2"
                                onClick={() => {
                                    SpeechRecognition.startListening({
                                        language: "en-US",
                                        continuous: true
                                    })
                                }}
                            >
                                {listening ? "Recording..." : "Start Recording"}
                            </button>
                            <div>
                                {browserSupportsSpeechRecognition && (

                                    browserSupportsSpeechRecognition

                                )}
                            </div>

                        </section>
                        <section>
                            <audio
                                id="MyAudio"
                                src=""
                            />
                        </section>
                    </>

                ) : (
                    <div className="flex flex-col items-center justify-center h-screen">
                        <button
                            className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-20 py-2.5 mr-2 mb-2"
                            onClick={() => setIsStart(true)}
                        >
                            Start
                        </button>
                    </div>
                )
            }
        </main>
    )
}
