// src/pages/admin/Payments.jsx
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { API_BASE_URL } from "../../config/api";
import { useToast } from "../../components/toast/useToast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Payments() {
  /* ---------- STATE ---------- */
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Stats filters
  const [statsStart, setStatsStart] = useState("");
  const [statsEnd, setStatsEnd] = useState("");

  // Transactions filters
  const [txFilters, setTxFilters] = useState({
    status: "",
    method: "",
    start_date: "",
    end_date: "",
  });
  const [txPage, setTxPage] = useState(1);
  const [txPerPage] = useState(25);

  /* ---------- FETCH HELPERS ---------- */
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (statsStart) params.append("start_date", statsStart);
      if (statsEnd) params.append("end_date", statsEnd);

      const url = `${API_BASE_URL}/admin/reporting/payments-stats${
        params.toString() ? `?${params}` : ""
      }`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.status === "success") {
        // Normalise string numbers + camelCase to snake_case
        const normalise = (obj) => {
          if (Array.isArray(obj)) return obj.map(normalise);
          if (obj && typeof obj === "object") {
            const copy = {};
            for (const [k, v] of Object.entries(obj)) {
              const newKey = k.replace(
                /[A-Z]/g,
                (m) => `_${m.toLowerCase()}`
              );
              copy[newKey] =
                typeof v === "string" && !isNaN(Number(v)) && v.includes(".")
                  ? Number(v)
                  : v;
              if (typeof v === "object" && v !== null) copy[newKey] = normalise(v);
            }
            return copy;
          }
          return obj;
        };

        setStats(normalise(json.data));
      } else {
        showToast({ type: 'error', message: json.message ?? 'Failed to load stats' });
      }
    } catch (e) {
      showToast({ type: 'error', message: e.message ?? 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const qs = new URLSearchParams({
        page: String(txPage),
        per_page: String(txPerPage),
        status: txFilters.status,
        method: txFilters.method,
        start_date: txFilters.start_date,
        end_date: txFilters.end_date,
      }).toString();

      const res = await fetch(
        `${API_BASE_URL}/admin/reporting/payments-transactions?${qs}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();

      if (json.status === "success") {
        setTransactions(json.data.transactions);
        setPagination(json.data.pagination);
      } else {
        showToast({ type: 'error', message: json.message ?? 'Failed to load transactions' });
      }
    } catch (e) {
      showToast({ type: 'error', message: e.message ?? 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    fetchStats();
  }, []); // initial load

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab, txPage, txFilters]);

  /* ---------- HANDLERS ---------- */
  const applyStatsFilter = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const applyTxFilter = (e) => {
    e.preventDefault();
    setTxPage(1);
    fetchTransactions();
  };

  const changeTxFilter = (e) => {
    const { name, value } = e.target;
    setTxFilters((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Payment Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        <Button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-[#D6BA69] text-[#D6BA69]"
              : "text-gray-500"
          }`}
        >
          Overview
        </Button>
        <Button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === "transactions"
              ? "border-b-2 border-[#D6BA69] text-[#D6BA69]"
              : "text-gray-500"
          }`}
        >
          Transactions
        </Button>
      </div>

      {/* Global loading / error */}
  {loading && <Loader text="Loading..." />}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* ==================== OVERVIEW TAB ==================== */}
      {activeTab === "overview" && stats && !loading && (
        <div className="space-y-8">
          {/* Date filter */}
          <form onSubmit={applyStatsFilter} className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={statsStart}
              onChange={(e) => setStatsStart(e.target.value)}
              className="border rounded px-3 py-1"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={statsEnd}
              onChange={(e) => setStatsEnd(e.target.value)}
              className="border rounded px-3 py-1"
              placeholder="End Date"
            />
            <Button
              type="submit"
              className="bg-[#D6BA69] text-black px-4 py-1 rounded hover:bg-[#c9a63a]"
            >
              Apply
            </Button>
          </form>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Transactions", value: stats.summary.total_transactions },
              { label: "Total Revenue", value: `${stats.summary.total_revenue} FCFA` },
              { label: "Paid", value: stats.summary.paid },
              { label: "Pending", value: stats.summary.pending },
              { label: "Failed", value: stats.summary.failed },
              { label: "Refunded", value: stats.summary.refunded },
            ].map((kpi, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-4 text-center"
              >
                <p className="text-xs text-gray-600">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue by Day */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Revenue by Day</h2>
            <div className="bg-white rounded-lg shadow p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenue_by_day}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    name="Revenue (FCFA)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    name="Transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By Method – Pie + Table */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Revenue by Method (Pie)</h2>
              <div className="bg-white rounded-lg shadow p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.by_method}
                      dataKey="revenue"
                      nameKey="payment_method"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {stats.by_method.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Revenue by Method (Table)</h2>
              <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Method</th>
                      <th className="text-left py-2">Count</th>
                      <th className="text-left py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.by_method.map((m) => (
                      <tr key={m.payment_method} className="border-b">
                        <td className="py-1">{m.payment_method}</td>
                        <td className="py-1">{m.count}</td>
                        <td className="py-1">{m.revenue} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Boosted Ads */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Top Boosted Ads</h2>
            <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ad ID</th>
                    <th className="text-left py-2">Boosts</th>
                    <th className="text-left py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_boosted_ads.map((ad) => (
                    <tr key={ad.ad_id} className="border-b">
                      <td className="py-1">{ad.ad_id}</td>
                      <td className="py-1">{ad.payments_count}</td>
                      <td className="py-1">{ad.revenue} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Transactions */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Latest Transactions</h2>
            <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ref.</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Method</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.latest_transactions.map((tx) => (
                    <tr key={tx.id} className="border-b">
                      <td className="py-1">{tx.reference}</td>
                      <td className="py-1">{tx.amount} FCFA</td>
                      <td className="py-1">{tx.status}</td>
                      <td className="py-1">{tx.payment_method}</td>
                      <td className="py-1">{tx.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TRANSACTIONS TAB ==================== */}
      {activeTab === "transactions" && !loading && (
        <div className="space-y-8">
          {/* Filters */}
          <form
            onSubmit={applyTxFilter}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
          >
            <select
              name="status"
              value={txFilters.status}
              onChange={changeTxFilter}
              className="border rounded px-3 py-1"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <input
              type="text"
              name="method"
              placeholder="Payment Method"
              value={txFilters.method}
              onChange={changeTxFilter}
              className="border rounded px-3 py-1"
            />

            <input
              type="date"
              name="start_date"
              value={txFilters.start_date}
              onChange={changeTxFilter}
              className="border rounded px-3 py-1"
            />

            <input
              type="date"
              name="end_date"
              value={txFilters.end_date}
              onChange={changeTxFilter}
              className="border rounded px-3 py-1"
            />

            <Button
              type="submit"
              className="bg-[#D6BA69] text-black px-4 py-1 rounded hover:bg-[#c9a63a]"
            >
              Filter
            </Button>
          </form>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3">Ref.</th>
                    <th className="text-left py-2 px-3">Amount</th>
                    <th className="text-left py-2 px-3">Phone</th>
                    <th className="text-left py-2 px-3">Method</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Description</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Ad Title</th>
                    <th className="text-left py-2 px-3">User Email</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{tx.reference}</td>
                      <td className="py-2 px-3">{tx.amount} FCFA</td>
                      <td className="py-2 px-3">{tx.phone ?? "-"}</td>
                      <td className="py-2 px-3">{tx.payment_method}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            tx.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : tx.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">{tx.description ?? "-"}</td>
                      <td className="py-2 px-3">{tx.created_at}</td>
                      <td className="py-2 px-3">{tx.ad_title ?? "-"}</td>
                      <td className="py-2 px-3">{tx.user_email ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-gray-500">No transactions found.</p>
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-between items-center">
              <Button
                type="button"
                onClick={() => setTxPage((p) => Math.max(p - 1, 1))}
                disabled={txPage === 1}
                className="bg-[#D6BA69] text-black px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </Button>
              <span>
                Page {pagination.current_page} / {pagination.total_pages}
              </span>
              <Button
                type="button"
                onClick={() =>
                  setTxPage((p) => Math.min(p + 1, pagination.total_pages))
                }
                disabled={txPage === pagination.total_pages}
                className="bg-[#D6BA69] text-black px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}