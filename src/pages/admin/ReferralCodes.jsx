import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import adminService from "../../services/adminService";

const ReferralCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getReferralCodes();
      if (response.status === "success") {
        setCodes(response.data.codes);
      } else {
        throw new Error(response.message || "Error loading referral codes");
      }
    } catch (err) {
      setError(err.message || "Error loading referral codes");
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter(
    (code) =>
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader text="Loading referral codes..." className="min-h-[400px]" />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-2">Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchCodes} className="w-full">
            Retry
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Codes</h1>
          <p className="text-muted-foreground mt-1">Manage all referral codes used by users</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search referral codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Owner</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Created At</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono">{code.code}</td>
                    <td className="p-4">{code.owner || "-"}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          code.active
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {code.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">{new Date(code.createdAt).toLocaleString("en-US")}</td>
                    <td className="p-4">
                      <Button size="sm" className="mr-2">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCodes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No referral codes found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralCodes;
