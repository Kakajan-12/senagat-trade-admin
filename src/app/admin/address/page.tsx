'use client'
import React, { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PencilIcon, PlusCircleIcon, TrashIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { Dialog, Transition } from "@headlessui/react";

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

interface Address {
    id: string;
    address_en: string;
    address_ru: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }: ModalProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 flex items-center">
                                        {title}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{message}</p>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

const Address = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [modalMessage, setModalMessage] = useState("");

    const router = useRouter();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/address`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAddresses(response.data);
                setError(null);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchAddresses();
    }, [router]);


    const handleDeleteClick = (address: Address) => {
        setSelectedAddress(address);
        setModalMessage(`Are you sure you want to delete this address "${address.address_en}"? This action cannot be undone.`);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedAddress) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/address/${selectedAddress.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAddresses(prev => prev.filter(addr => addr.id !== selectedAddress.id));
            setModalMessage(`Адрес "${selectedAddress.address_en}" успешно удален!`);

        } catch (err) {
            console.error('Ошибка при удалении:', err);

            let errorMessage = "Ошибка при удалении адреса";

            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    router.push("/");
                    return;
                }

                if (axios.isAxiosError<ApiErrorResponse>(err)) {
                    if (err.response?.status === 401) {
                        router.push("/");
                        return;
                    }

                    const errorData = err.response?.data;

                    if (errorData?.error) {
                        errorMessage = errorData.error;
                    } else if (errorData?.message) {
                        errorMessage = errorData.message;
                    }
                }

            }

            setModalMessage(errorMessage);

        } finally {
            setLoading(false);
            setSelectedAddress(null);
            setShowDeleteModal(false);
        }
    };

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 p-10 ml-62 flex items-center justify-center">
                    <div className="text-red-500 text-lg">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAddress(null);
                }}
                onConfirm={confirmDelete}
                title="Confirmation of deletion"
                message={modalMessage}
                isLoading={loading}
            />

            <div className="min-h-screen bg-gray-100">
                <div className="flex">
                    <Sidebar/>
                    <div className="flex-1 p-6 lg:p-10 ml-0 lg:ml-62">
                        <TokenTimer/>

                        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Addresses</h2>
                                <Link
                                    href="/admin/address/add-address"
                                    className="mt-4 md:mt-0 bg text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                                >
                                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                                    Add
                                </Link>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead>
                                    <tr className="divide-x-1 divide-gray-200">
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            ID
                                        </th>
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            Address (English)
                                        </th>
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            Address (Russian)
                                        </th>
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            Edit
                                        </th>
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            Delete
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y-1 divide-gray-200">
                                    {addresses.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-500">
                                                no data
                                            </td>
                                        </tr>
                                    ) : (
                                        addresses.map((address) => (
                                            <tr key={address.id} className="divide-x-1 divide-gray-200">
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-gray-600">#{address.id}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-gray-800">{address.address_en}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-gray-800">{address.address_ru}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/admin/address/edit-address/${address.id}`}
                                                            className="flex items-center justify-center bg text-white py-2 px-4 rounded-lg transition duration-200"
                                                        >
                                                            <PencilIcon className="h-4 w-4 mr-1"/>
                                                            <span className="text-sm">Edit</span>
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteClick(address)}
                                                            disabled={loading}
                                                            className="flex items-center justify-center bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <TrashIcon className="h-4 w-4 mr-1"/>
                                                            <span className="text-sm">Delete</span>
                                                        </button>
                                                    </div>
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
            </div>
        </>
    );
};

export default Address;