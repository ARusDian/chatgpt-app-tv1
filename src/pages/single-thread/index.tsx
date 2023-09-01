"use client"
import Link from "next/link";
import { use, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import OpenAI from 'openai';
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";

export default function keren() {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        // @ts-ignorex
        dangerouslyAllowBrowser: true
    });
    const [formState, setFormState] = useState({
        prompt: "kucing adalah",
        answer: "Ask me anything!",
        options: [],
    });

    const [queueText, setQueueText] = useState<string[]>([]);

    const [queueAudio, setQueueAudio] = useState([]);

    const [isAsking, setIsAsking] = useState(false);

    const chatLogs: CreateChatCompletionRequestMessage[] = []

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setFormState({ ...formState, prompt: transcript });
        }
    }, [transcript]);

    const submitHandler = async () => {
        try {
            chatLogs.push({ role: "user", content: formState.prompt });
            const completion = await openai.chat.completions.create({
                messages: chatLogs,
                model: 'gpt-3.5-turbo',
            });

            console.log(completion.choices);
            setFormState({
                ...formState,
                answer: completion.choices[0].message.content ?? ""
            })

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
                    audio?.removeAttribute('src')
                    audio.src = data.src;
                    audio.play();
                }
            )



        } catch (err) {
            console.log(err);
        }

    };

    const resetHandler = () => {
        resetTranscript();
        setFormState({
            ...formState,
            prompt: "",
            answer: "Ask me anything!",
        });
    };

    return (
        <div className="text-black flex justify-center bg-black">
            <div className="my-12 w-3/5">
                <form className="flex flex-col gap-5">
                    <div className="flex gap-3">
                        <label htmlFor="prompt" className="text-white">Prompt</label>
                        <textarea
                            className="mt-1 block w-full p-2 resize-y"
                            name="prompt"
                            id="prompt"
                            value={formState.prompt}
                            onChange={(e) => setFormState({ ...formState, prompt: e.target.value })}
                        />
                    </div>
                    {!isAsking ? (
                        <div className="flex gap-3">
                            <label htmlFor="prompt" className="text-white ">Answer</label>
                            <textarea
                                className="mt-1 block w-full p-2 resize-y h-full bg-white"
                                name="answer"
                                id="answer"
                                disabled
                                value={formState.answer}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-white text-lg">
                            Loading....
                        </div>
                    )}
                </form>
                <div className="flex justify-center mt-5">
                    <button
                        onClick={submitHandler}
                        className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 px-5 rounded-lg text-md font-semibold m-5 mt-10 w-1/2">
                        Submit
                    </button>
                </div>
                <audio
                    src="https://assets.coderrocketfuel.com/pomodoro-times-up.mp3"
                    id="audio"

                />
                <p className="text-white">Microphone: {listening ? 'on' : 'off'}</p>
                <div className="flex flex-col lg:flex-row justify-center mt-5">
                    <button
                        className="bg-blue-500 text-white hover:bg-yellow-600 py-3 w-full rounded-lg text-md font-semibold m-5 mt-10"
                        onClick={() => SpeechRecognition.startListening({ language: "en-US" })}>Start</button>
                    <button
                        className="bg-red-500 text-white hover:bg-yellow-600 py-3 w-full rounded-lg text-md font-semibold m-5 mt-10"
                        onClick={SpeechRecognition.stopListening}>Stop</button>
                    <button
                        className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 w-full rounded-lg text-md font-semibold m-5 mt-10"
                        onClick={resetHandler}>Reset</button>
                    <p>{transcript}</p>
                </div>
                <div>
                    {browserSupportsSpeechRecognition && (

                        browserSupportsSpeechRecognition

                    )}
                </div>
                <div
                    className="flex justify-center"
                >
                    <Link
                        className="bg-blue-500 text-white text-center hover:bg-yellow-600 py-3 w-1/2 rounded-lg text-md font-semibold m-5 mt-10"
                        href={"/"}
                    >
                        Awal
                    </Link>
                </div>
                <div>
                    <audio
                        id="MyAudio"
                        controls
                    />
                </div>
            </div>
        </div>
    )
}
