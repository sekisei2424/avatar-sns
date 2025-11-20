import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Job = Database['public']['Tables']['jobs']['Row'];

export default function JobBoard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJobs() {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setJobs(data);
            }
            setLoading(false);
        }

        fetchJobs();
    }, []);

    if (loading) return <div className="text-center">Loading jobs...</div>;

    return (
        <div className="space-y-4">
            {jobs.length === 0 ? (
                <p className="text-gray-400 text-center">No jobs available right now.</p>
            ) : (
                jobs.map((job) => (
                    <div key={job.id} className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{job.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${job.status === 'open' ? 'bg-green-900 text-green-300' : 'bg-gray-700'}`}>
                                {job.status}
                            </span>
                        </div>
                        <button className="bg-village-accent px-3 py-1 rounded text-sm hover:bg-green-600">
                            Apply
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
