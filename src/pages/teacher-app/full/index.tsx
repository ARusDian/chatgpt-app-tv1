"use client"
import { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import { useRouter } from "next/router";

class Soal {
    public pertanyaan: string = "";
    public pilihan: Array<{
        value: string,
        content: string
    }> = [];
    public jawaban: {
        value: string,
        content: string
    } = {
            value: "",
            content: ""
        };

    Soal(pertanyaan: string, pilihan: Array<{
        value: string,
        content: string
    }>, jawaban: {
        value: string,
        content: string
    }) {
        this.pertanyaan = pertanyaan;
        this.pilihan = pilihan;
        this.jawaban = jawaban;
    }
}

export default function full() {
    const router = useRouter()

    const config = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
    });

    const api = new OpenAIApi(config);

    // const api = new ChatGPTAPI({
    //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
    //     debug: true,
    //     completionParams: {
    //         model: 'gpt-3.5-turbo-16k-0613',
    //         temperature: 0.5,
    //         max_tokens: 5000,
    //     }
    // });

    const [soal, setSoal] = useState<Soal[]>([]);
    const [status, setStatus] = useState<string>("");
    console.log(soal);

    const prompt = `Buatlah kuis dengan pilihan ganda pada topik Perangkat Lunak yang terdiri dari 10 pertanyaan. Setiap pertanyaan memiliki 5  kemungkinan jawaban. Formatnya seperti json dalam 1 baris panjang dan dibungkus array dengan key soal,pilihan,jawaban agar mudah di parse. Contoh formatnya seperti ini:
    [{"soal":"soal","pilihan":[{"value":"a","content":"pilihan1"},{"value":"b","content":"pilihan2"}],"jawaban":{"value":"","content":"jawaban1"}},{"soal":"soal","pilihan":[{"value":"a","content":"pilihan1"},{"value":"b","content":"pilihan2"}],"jawaban":{"value":"","content":"jawaban2"}}]`;

    const submitHandler = async () => {
        setStatus("loading");
        const result = await api.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 2000,
        }).then((response) => {
            localStorage.removeItem('soal');
            localStorage.setItem('soal', response.data.choices[0].text?.replace('\n', '') as string);
            const rawSoal = JSON.parse(response.data.choices[0].text?.replace('\n', '') as string);
            const soalList: Soal[] = [];
            rawSoal.forEach((element: any) => {
                const soalTemp = new Soal();
                soalTemp.pertanyaan = element.soal;
                soalTemp.pilihan = element.pilihan;
                soalTemp.jawaban = element.jawaban;
                soalList.push(soalTemp);
            });
            setSoal(soalList);
            setStatus("success");
            router.push('/teacher-app/full/pengerjaan')
        }).catch((err) => {
            setStatus("error");
            console.log(err);
        });
    };


    return (
        <div className="bg-white flex justify-center h-screen">
            <div className="my-auto w-full flex flex-col gap-5">
                <div className="flex justify-center">
                    {status === "error" ? <div className="text-2xl font-semibold text-red-600">Terjadi kesalahan, silahkan coba lagi</div> : ""}
                </div>
                <div className="flex justify-center">
                    <div className="text-2xl font-semibold">Exam AI</div>
                </div>
                <div className="flex justify-center">
                    {status === "loading" ?
                        <div className="flex flex-col gap-5">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                            <div className="text-2xl font-semibold text-black">Sedang membuat soal...</div>
                        </div> :
                        status === "success" ?
                            <div className="flex flex-col gap-5">
                                <div className="text-2xl font-semibold text-black">Soal berhasil dibuat</div>
                                <div className="text-2xl font-semibold text-black">Silahkan lanjut ke pengerjaan</div>
                            </div> :
                            <button
                                onClick={submitHandler}
                                className="bg-green-600 text-white hover:bg-green-600 py-8 px-5 rounded-lg text-2xl font-semibold w-1/2">
                                Mulai
                            </button>
                    }
                </div>

            </div>
        </div>
    );
}
