'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {PencilIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

interface HeaderItem {
    id: number;
    images: string;
    header_name: string;
}

const HeaderImages = () => {
    const [headers, setHeaders] = useState<HeaderItem[]>([]);
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

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/header`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setHeaders(response.data);
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
                            <h2 className="text-2xl font-bold mb-4">Headers</h2>
                        </div>
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                            <tr className="divide-x-1 divide-gray-200">
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Image</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Header Name</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-center text-gray-600">Edit</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y-1 divide-gray-200">
                            {headers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No data available</td>
                                </tr>
                            ) : (
                                headers.map(header => (
                                    <tr key={header.id} className="divide-x-1 divide-gray-200">
                                        <td className="py-4 px-4">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${header.images}`.replace(/\\/g, '/')}
                                                alt={`header ${header.id}`}
                                                width={100}
                                                height={100}
                                            />

                                        </td>
                                        <td className="py-4 px-4">
                                            <p>{header.header_name}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Link href={`/admin/header/edit-header/${header.id}`}
                                                  className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"><PencilIcon
                                                color="#ffffff"/>
                                                <div className="ml-2">Edit</div>
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

export default HeaderImages;