'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {PencilIcon, TrashIcon, ExclamationTriangleIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

interface PartnersItem {
    id: number;
    logo: string;
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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                    removing...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ErrorModal = ({ isOpen, onClose, title, message }: { isOpen: boolean; onClose: () => void; title: string; message: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HeaderImages = () => {
    const [partners, setPartners] = useState<PartnersItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setPartners(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };
        fetchData();
    }, [router]);



    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setModalMessage(`Are you sure you want to remove your partner #${id}? This action cannot be undone.`);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPartners(prev => prev.filter(partner => partner.id !== deleteId));


        } catch (err) {
            const axiosError = err as AxiosError;
            console.error(axiosError);

            let errorMessage = "Ошибка при удалении";
            if (axios.isAxiosError(axiosError)) {
                if (axiosError.response?.status === 401) {
                    router.push("/");
                    return;
                } else {
                    errorMessage = errorMessage;
                }
            }

            setModalMessage(errorMessage);
            setShowErrorModal(true);

        } finally {
            setLoading(false);
            setDeleteId(null);
            setShowDeleteModal(false);
        }
    };

    const handleAddNew = () => {
        router.push('/admin/partners/add-partner');
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
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Confirm deletion"
                message={modalMessage}
                isLoading={loading}
            />

            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Ошибка"
                message={modalMessage}
            />

            <div className="min-h-screen bg-gray-100">
                <div className="flex">
                    <Sidebar/>
                    <div className="flex-1 p-6 lg:p-10 ml-0 lg:ml-62">
                        <TokenTimer/>

                        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Partners</h2>
                                <button
                                    onClick={handleAddNew}
                                    className="mt-4 md:mt-0 bg text-white font-bold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                                >
                                    + Add
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="divide-x-1 divide-gray-200">
                                    <tr className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            ID
                                        </th>
                                        <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                                            Logo
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
                                    {partners.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8 text-gray-500">
                                                Нет данных о партнерах
                                            </td>
                                        </tr>
                                    ) : (
                                        partners.map(partner => (
                                            <tr key={partner.id} className="divide-x-1 divide-gray-200">
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-gray-600">#{partner.id}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                        <Image
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${partner.logo}`.replace(/\\/g, '/')}
                                                            alt={`Partner ${partner.id}`}
                                                            width={100}
                                                            height={100}
                                                        />
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/admin/partners/edit-partner/${partner.id}`}
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
                                                            onClick={() => handleDeleteClick(partner.id)}
                                                            disabled={loading && deleteId === partner.id}
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
    )
}

export default HeaderImages;