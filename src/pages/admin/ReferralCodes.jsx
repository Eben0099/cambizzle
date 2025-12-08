import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/toast/useToast";
import { 
  Users, 
  Search as SearchIcon, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import adminService from "../../services/adminService";

const ReferralCodes = () => {
  const { showToast } = useToast();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCode, setExpandedCode] = useState(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReferralCodes();
      if (Array.isArray(response)) {
        setCodes(response);
      } else if (response.status === "success" && Array.isArray(response.data)) {
        setCodes(response.data);
      } else {
        throw new Error(response.message || "Error loading referral codes");
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Error loading referral codes' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter(
    (code) =>
      code.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (codeId) => {
    setExpandedCode(expandedCode === codeId ? null : codeId);
  };

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Codes</h1>
          <p className="text-gray-600 mt-1">Manage all referral codes and track referrals</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Codes</div>
          <div className="text-2xl font-bold text-[#D6BA69]">{codes.length}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {codes.filter(c => c.isActive === "1").length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {codes.reduce((sum, c) => sum + parseInt(c.currentUses || 0), 0)}
                </p>
              </div>
              <Users className="h-10 w-10 text-[#D6BA69]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Uses per Code</p>
                <p className="text-2xl font-bold text-gray-900">
                  {codes.length > 0 
                    ? (codes.reduce((sum, c) => sum + parseInt(c.currentUses || 0), 0) / codes.length).toFixed(1)
                    : 0}
                </p>
              </div>
              <User className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by code, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Referral Codes List */}
      <div className="space-y-3">
        {filteredCodes.map((code) => (
          <Card key={code.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Main Code Info */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(code.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Code */}
                    <div className="bg-[#D6BA69] text-white px-4 py-2 rounded-lg font-mono font-bold text-lg">
                      {code.code}
                    </div>

                    {/* Owner Info */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {code.firstName} {code.lastName}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {code.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {code.phone}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#D6BA69]">{code.currentUses}</div>
                        <div className="text-xs text-gray-600">Uses</div>
                      </div>
                      
                      <Badge
                        className={
                          code.isActive === "1"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {code.isActive === "1" ? (
                          <><CheckCircle className="h-3 w-3 mr-1 inline" />Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1 inline" />Inactive</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="ml-4">
                    {expandedCode === code.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Filleuls Section */}
              {expandedCode === code.id && code.filleuls && code.filleuls.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Referrals ({code.filleuls.length})
                  </h4>
                  <div className="space-y-2">
                    {code.filleuls.map((filleul) => (
                      <div 
                        key={filleul.idUser} 
                        className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-[#D6BA69] text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                            {filleul.firstName?.charAt(0)}{filleul.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {filleul.firstName} {filleul.lastName}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {filleul.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {filleul.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(filleul.usedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(filleul.usedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedCode === code.id && (!code.filleuls || code.filleuls.length === 0) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-gray-500 text-sm">
                  No referrals yet
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredCodes.length === 0 && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-8 text-center text-gray-500">
              No referral codes found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReferralCodes;
