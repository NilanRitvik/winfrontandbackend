import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

const AdminAIPage = () => {
    const [formData, setFormData] = useState({
        numbers: '',
        series: '',
        line: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLatest();
    }, []);

    const fetchLatest = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin-ai/latest`);
            if (res.data && res.data.numbers) {
                setFormData({
                    numbers: res.data.numbers.join(', '),
                    series: res.data.series || '',
                    line: res.data.line || ''
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation: Check if 25 numbers
        const numArr = formData.numbers.split(',').map(n => n.trim()).filter(n => n !== '');
        if (numArr.length !== 25) {
            toast.error(`Please enter exactly 25 numbers. Currently: ${numArr.length}`);
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/admin-ai/update`, {
                numbers: numArr.map(Number),
                series: formData.series,
                line: formData.line
            });
            toast.success("AI Prediction Updated Successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] p-6 rounded-lg text-white max-w-4xl mx-auto border border-[#d4af37]/30">
            <h2 className="text-3xl font-serif text-[#d4af37] mb-6">Daily AI Manual Update</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-400 mb-2 uppercase text-xs font-bold">25 Numbers (Comma Separated)</label>
                    <textarea
                        name="numbers"
                        value={formData.numbers}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-gray-700 rounded p-4 text-white font-mono focus:border-[#d4af37] focus:outline-none min-h-[120px]"
                        placeholder="0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter exactly 25 numbers, separated by commas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 uppercase text-xs font-bold">Series Number Name</label>
                        <input
                            type="text"
                            name="series"
                            value={formData.series}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#d4af37] focus:outline-none"
                            placeholder="e.g. Series A / Tiers"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 uppercase text-xs font-bold">Line Number Name</label>
                        <input
                            type="text"
                            name="line"
                            value={formData.line}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#d4af37] focus:outline-none"
                            placeholder="e.g. Line 2 / Middle"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all ${loading ? 'bg-gray-600' : 'bg-gradient-to-r from-[#d4af37] to-[#b48d28] hover:scale-[1.02] text-black shadow-lg shadow-[#d4af37]/20'}`}
                >
                    {loading ? "Updating..." : "Update Daily AI Data"}
                </button>
            </form>
        </div>
    );
};

export default AdminAIPage;
