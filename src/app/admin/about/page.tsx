'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {EyeIcon, PlusCircleIcon} from "@heroicons/react/16/solid";

interface DataItem {
    id: number;
    title_en: string;
    title_ru: string;
}

const About = () => {
    const [products, setProducts] = useState<DataItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProducts(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchTours();
    }, [router]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="">
            <div className="flex bg-gray-200">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>
                    <div className="mt-8">
                        <div className="w-full flex justify-between">
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <Link href="/admin/about/add-about"
                                  className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"><PlusCircleIcon
                                className="size-6" color="#ffffff"/>
                                <div className="ml-2">Add</div>
                            </Link>
                        </div>
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                            <tr className="divide-x-1 divide-gray-200">
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Title (Englis)</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Title (Russian)</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-center text-gray-600">View</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y-1 divide-gray-200">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No data available</td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="divide-x-1 divide-gray-200">
                                        <td className="py-4 px-4">
                                            <p>{product.title_en}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p>{product.title_ru}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Link href={`/admin/about/view-about/${product.id}`}
                                                  className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"><EyeIcon
                                                color="#ffffff"/>
                                                <div className="ml-2">View</div>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About;