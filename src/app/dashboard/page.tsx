import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#030711] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Your Analyses</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.email}</span>
            <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition-colors">
              New Search
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20">
            Error loading reports: {error.message}
          </div>
        )}

        {!reports?.length ? (
          <div className="text-center text-gray-400 py-12">
            No analyses found. Head back home to run your first report.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Link href={`/report/${report.id}`} key={report.id}>
                <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                        {report.company_name}
                      </h3>
                      {report.ticker_symbol && (
                        <span className="text-sm text-gray-400">{report.ticker_symbol}</span>
                      )}
                    </div>
                    <Badge variant={report.recommendation === 'INVEST' ? 'default' : report.recommendation === 'HOLD' ? 'secondary' : 'destructive'} 
                      className={report.recommendation === 'INVEST' ? 'bg-emerald-500/20 text-emerald-400' : report.recommendation === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                      {report.recommendation}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-400 mb-4">
                    <div>
                      <span className="block text-xs uppercase opacity-70">Score</span>
                      <span className="text-white font-medium">{report.investment_score}/100</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase opacity-70">Confidence</span>
                      <span className="text-white font-medium">{report.confidence_score}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
