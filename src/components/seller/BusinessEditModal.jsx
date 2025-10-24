import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  X,
  Store,
  Globe,
  Clock,
  Truck,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const BusinessEditModal = ({ isOpen, onClose, sellerProfile, onSubmit }) => {
  const [formData, setFormData] = useState({
    businessName: sellerProfile?.businessName || "",
    businessDescription: sellerProfile?.businessDescription || "",
    businessAddress: sellerProfile?.businessAddress || "",
    businessPhone: sellerProfile?.businessPhone || "",
    businessEmail: sellerProfile?.businessEmail || "",
    websiteUrl: sellerProfile?.websiteUrl || "",
    facebookUrl: sellerProfile?.facebookUrl || "",
    instagramUrl: sellerProfile?.instagramUrl || "",
    openingHours:
      sellerProfile?.openingHours || {
        monday: { open: "09:00", close: "18:00", closed: false },
        tuesday: { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday: { open: "09:00", close: "18:00", closed: false },
        friday: { open: "09:00", close: "18:00", closed: false },
        saturday: { open: "09:00", close: "18:00", closed: false },
        sunday: { open: "09:00", close: "18:00", closed: true },
      },
    deliveryOptions:
      sellerProfile?.deliveryOptions || {
        pickup: false,
        delivery: false,
        shipping: false,
      },
  });

  const [errors, setErrors] = useState({});

  const daysOfWeek = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleDeliveryOptionChange = (option, checked) => {
    setFormData((prev) => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required.";
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = "Description is required.";
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "Address is required.";
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = "Phone number is required.";
    } else if (formData.businessPhone.replace(/\D/g, "").length < 8) {
      newErrors.businessPhone = "Invalid phone number.";
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Invalid email format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Store className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Edit Business Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* General Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Store className="w-5 h-5 mr-2 text-[#D6BA69]" />
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                error={errors.businessName}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Phone
                </label>
                <PhoneInput
                  country={"cm"}
                  value={formData.businessPhone}
                  onChange={(value) => handleInputChange("businessPhone", value)}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "8px",
                    borderColor: errors.businessPhone ? "#f87171" : "#d1d5db",
                  }}
                  containerClass="focus-within:ring-2 focus-within:ring-[#D6BA69]"
                  enableSearch
                />
                {errors.businessPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.businessPhone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) =>
                  handleInputChange("businessDescription", e.target.value)
                }
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D6BA69] ${
                  errors.businessDescription ? "border-red-300" : "border-gray-300"
                }`}
                required
              />
              {errors.businessDescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.businessDescription}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Address"
                value={formData.businessAddress}
                onChange={(e) =>
                  handleInputChange("businessAddress", e.target.value)
                }
                error={errors.businessAddress}
                required
              />
              <Input
                label="Business Email"
                type="email"
                value={formData.businessEmail}
                onChange={(e) =>
                  handleInputChange("businessEmail", e.target.value)
                }
                error={errors.businessEmail}
                required
              />
            </div>
          </section>

          {/* Online Presence */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Online Presence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Website"
                placeholder="https://..."
                value={formData.websiteUrl}
                onChange={(e) =>
                  handleInputChange("websiteUrl", e.target.value)
                }
              />
              <Input
                label="Facebook"
                placeholder="https://facebook.com/..."
                value={formData.facebookUrl}
                onChange={(e) =>
                  handleInputChange("facebookUrl", e.target.value)
                }
              />
              <Input
                label="Instagram"
                placeholder="https://instagram.com/..."
                value={formData.instagramUrl}
                onChange={(e) =>
                  handleInputChange("instagramUrl", e.target.value)
                }
              />
            </div>
          </section>

          {/* Opening Hours */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Opening Hours
            </h3>

            <div className="space-y-3">
              {Object.entries(daysOfWeek).map(([day, label]) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-24 font-medium text-gray-900">{label}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!formData.openingHours[day]?.closed}
                      onChange={(e) =>
                        handleOpeningHoursChange(day, "closed", !e.target.checked)
                      }
                      className="text-[#D6BA69] border-gray-300 focus:ring-[#D6BA69]"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  {!formData.openingHours[day]?.closed && (
                    <>
                      <input
                        type="time"
                        value={formData.openingHours[day]?.open || "09:00"}
                        onChange={(e) =>
                          handleOpeningHoursChange(day, "open", e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.openingHours[day]?.close || "18:00"}
                        onChange={(e) =>
                          handleOpeningHoursChange(day, "close", e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Options */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Truck className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Delivery Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "pickup", label: "Store Pickup" },
                { key: "delivery", label: "Local Delivery" },
                { key: "shipping", label: "National Shipping" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.deliveryOptions[opt.key]}
                    onChange={(e) =>
                      handleDeliveryOptionChange(opt.key, e.target.checked)
                    }
                    className="text-[#D6BA69] border-gray-300 focus:ring-[#D6BA69]"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#D6BA69] hover:bg-[#c9a950] text-black font-medium"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessEditModal;
