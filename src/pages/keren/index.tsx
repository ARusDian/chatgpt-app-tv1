"use client"
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ChatGPTUnofficialProxyAPI } from "chatgpt";

export default function keren() {
    const api = new ChatGPTUnofficialProxyAPI({
        accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhcnVzaGR5bmVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItREdSTXhOTTdQMVFGd0I2RUJQTzRWSUdzIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2NDY2OWFkMmU0MDc4ZGNhZGU4ZWIxZjMiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjg0NDQ2NTYxLCJleHAiOjE2ODU2NTYxNjEsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb3JnYW5pemF0aW9uLndyaXRlIn0.PfErYhzKdCdD6I-hJOGXEqBAQQ7q3cooZtEyopcuXBRJOhwFs-Q5JBAcZ5Q1VggXLhO6TXMubMSHGrUAr64rbumjGhF8boTP6ZtgdmyFxcOZ0RWrQSa8aGKCGLW_GRvR7AV9fu2W9q-FAUPGbKIkk853tEROkHfoTM_JmcOAiT8588XTvNCzn0gy6j7AE0GiXNlxQ3CVPnVudkB7la7fim-UFDmlpj1viQhon825SJ-unLvYKzE5OAqCFspIz_UuIhKv426KWEerZQfk6jsSJDE8XOMEbNA8CrVco9rBnAcGKADcdH_d_Fn1Bm4KyZE_s3sjbK6t7y2vCh6UccJQSQ",
        apiReverseProxyUrl: "https://ai.fakeopen.com/api/conversation",
    })
    const [formState, setFormState] = useState({
        prompt: "",
        answer: "Ask me anything!",
        options: [],
    });

    const [isAsking, setIsAsking] = useState(false);

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
        setIsAsking(true);
        const response = await api.sendMessage(formState.prompt).then((res) => {
            console.log(res);
            setFormState({
                ...formState,
                answer: res.text
            });
        }).catch(err => {
            console.log({ err })
        });
        setIsAsking(false);

        resetTranscript();
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
            </div>
        </div>
    )
}
