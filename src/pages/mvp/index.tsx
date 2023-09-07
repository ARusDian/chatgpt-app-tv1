import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import OpenAI from 'openai';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import ReactLoading from 'react-loading';
import Rodal from 'rodal';

// include styles
import 'rodal/lib/rodal.css';
import router from "next/router";


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

    const [showResultModal, setShowResultModal] = useState<boolean>(false);
    const [isResultReady, setIsResultReady] = useState<boolean>(false);
    const [result, setResult] = useState<{
        scores: {
            fluency_coherence: number,
            lexical_resource: number,
            grammatical_range_accuracy: number,
            pronunciation: number
        },
        correct_text: string
    } | null>()
    const [isErrorResult, setIsErrorResult] = useState<boolean>(false);



    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [JSON.stringify(chatLogs)])

    useEffect(() => {
        if (isStart) {
            generateQuestion();
        }
    }, [isStart]);
    useEffect(() => {
        if (!listening && chatLogs.length > 0) {
            generateQuestion();
        }
    }, [listening]);

    useEffect(() => {
        const getResult = async () => {
            console.log("getting Result...")
            let retryCount = 0;
            let isDone = false;
            // TODO: Change the command prompt
            const command = "Please check the aspects of fluency and coherence, lexical resource, grammatical range and accuracy, pronountiation simillar like IELTS speaking test then give it score on each of them using percentaged and point out the wrong or error point in the text. It must returns an json contains 3 object which are an object with key scores it contains score each of four aspects in number and an object with key correct_text it contains only the correct version text with no explanation about the aspects like format { scores: { fluency_coherence: number, lexical_resource: number, grammatical_range_accuracy: number, pronunciation: number }, correct_text: string }";

            // const text = "Last weekend, me and my best buddy, we goes on a road trip. We drives for hours, and it was so much fun! We sees all kinds of interesting places, like a big, old castle on top of a hill. It was really cool, and we takes a selfie there. Then, we goes to this little town with a huge ice cream shop. They has like a hundred flavors, and I eats a big, chocolate sundae. It was delicious!\nMy sister, she don't likes to wake up early in the morning. She stays up late watching TV and then sleeps in until noon. She says it's the best way to get enough rest. But, sometimes, she misses important meetings and classes. I tells her to set an alarm, but she never listens. It's like she wants to be late all the time!\nAt my job, we has a big office party every year. Last year, we goes to a fancy restaurant. They serves the most delicious food, like lobster and caviar. I tries them for the first time, and it was interesting. But, the best part was the dancing. We dances all night long, and I have so much fun. I can't wait for this year's party!\nWhen I was a kid, I don't likes vegetables. My mom always tries to make me eats them, but I don't listens. I hides them under the table or gives them to the dog. Now, I realizes that vegetables are good for you, and I eats them every day. I wish I had listened to my mom when I was younger.\nMe and my friends, we goes camping every summer. We brings tents, sleeping bags, and lots of marshmallows for roasting. Last year, we goes to a remote forest. It was so quiet, and we hears the sounds of nature all around us. We tells scary stories by the campfire and laughs until late at night. It's the best way to spend the summer!\n"

            const text = chatLogs.filter(chat => chat.role === "user").join("\n")

            while (!isDone && retryCount < 10) {
                console.log(retryCount)
                try {
                    retryCount++;
                    const completion = await openai.chat.completions.create({
                        messages: [{ role: "user", content: text + command }],
                        model: 'gpt-3.5-turbo',
                    });
                    isDone = true;
                    console.log(completion.choices[0].message.content);
                    const result = JSON.parse(completion.choices[0].message.content ?? "")
                    console.log(result);
                    setResult(result);
                    setIsResultReady(true)
                } catch (e) {
                    // TODO: Make Error handler
                    
                    console.log("Error: ", e);
                    // condition for retrying
                    if (retryCount < 10) {
                        console.log("retrying :", retryCount)
                        continue;
                    } else {
                        // we don't want to retry
                        console.log(`retrying due to rate limit, retry count: ${retryCount}`);
                        isDone = true;
                    }
                }
            }
        }

        if (showResultModal) {
            getResult();
        }
    }, [showResultModal])

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
    // TODO: Styling

    return (
        <div className="flex w-[100vw] h-[100vh] flex-col px-20 py-12 gap-10">
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
                        </section>
                        <section className="flex justify-center">
                            <div>
                                {browserSupportsSpeechRecognition && (

                                    browserSupportsSpeechRecognition

                                )}
                            </div>
                        </section>
                        <section className="flex justify-center">
                            <button
                                type="button"
                                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-20 py-2.5 mr-2 mb-2"
                                onClick={() => setShowResultModal(true)}
                            >
                                Hasil
                            </button>
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

            <Rodal
                visible={showResultModal}
                width={1024 * (1 / 2)}
                height={1024 * (1 / 2)}
                onClose={() => setShowResultModal(false)}
            >
                <div className="h-full w-full my-auto flex justify-center flex-col">
                    <div className="">
                        {isResultReady ? (
                            <table className="min-w-full border border-gray-300 divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th scope="col"
                                            className="px-6 py-3 bg-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Criteria
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-3 bg-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-300">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            Fluency and Coherence
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {result?.scores.fluency_coherence}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            Lexical Resource
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {result?.scores.lexical_resource}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            Grammatical Range and Accuracy
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {result?.scores.grammatical_range_accuracy}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            Pronunciation
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {result?.scores.pronunciation}
                                        </td>
                                    </tr>
                                    {/* <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    Correct Text
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {result?.correct_text}
                                </td>
                            </tr> */}
                                </tbody>
                            </table>

                        ) : (
                            <>
                                {isErrorResult ? (
                                    <div>
                                        Error
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center my-auto">
                                        <div className="flex flex-col items-center gap-5">
                                            <ReactLoading color="#1964AD" type="spin" />
                                            <p>Sedang Memuat Hasil...</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex justify-around text-lg border-t pt-3">
                            <button
                                type="button"
                                className="inline-flex justify-center px-10 py-2 font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                onClick={() => {
                                    setShowResultModal(false);
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                   </div>
                </div>
            </Rodal>
        </div >
    )
}
