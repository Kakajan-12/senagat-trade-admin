'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddAddress = () => {
    const [address_en, setAddressEn] = useState('');
    const [address_ru, setAddressRu] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            address_en: address_en,
            address_ru: address_ru
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                setAddressEn('');
                setAddressRu('');
                router.push('/admin/address');
            } else {
                console.error('Ошибка при добавлении:', responseData);
                alert(`Ошибка: ${responseData.error || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4">Add addresses</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Address (English):</label>
                            <input
                                value={address_en}
                                onChange={(e) => setAddressEn(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Address (English):</label>
                            <input
                                value={address_ru}
                                onChange={(e) => setAddressRu(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add addresses
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAddress;
