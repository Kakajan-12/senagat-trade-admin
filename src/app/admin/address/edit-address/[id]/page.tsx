'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

interface Address {
    id: string;
    address_en: string;
    address_ru: string;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

const EditAddress = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [data, setData] = useState<Address>({
        id: '',
        address_en: '',
        address_ru: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get<Address>(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/address/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setData(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);

                if (axios.isAxiosError<ApiErrorResponse>(err)) {
                    if (err.response?.status === 401) {
                        router.push('/');
                        return;
                    }
                    setError(err.response?.data?.error || 'Ошибка при загрузке');
                } else {
                    setError('Ошибка при загрузке');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/address/${id}`,
                {
                    address_en: data.address_en,
                    address_ru: data.address_ru,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push('/admin/address');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);

            if (axios.isAxiosError<ApiErrorResponse>(err)) {
                if (err.response?.status === 401) {
                    router.push('/');
                    return;
                }
                setError(err.response?.data?.error || 'Ошибка при сохранении');
            } else {
                setError('Ошибка при сохранении');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-6 lg:p-10 ml-0 lg:ml-62">
                <TokenTimer />

                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-6">Edit address</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Address (English)
                            </label>
                            <input
                                name="address_en"
                                value={data.address_en}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Address (Russian)
                            </label>
                            <input
                                name="address_ru"
                                value={data.address_ru}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-6 py-2 rounded-lg flex items-center"
                        >
                            <DocumentIcon className="h-5 w-5 mr-2" />
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAddress;
