import mongoose from "mongoose";

const ServiceRequestSchema = new mongoose.Schema(
  {
    serviceTitle: { type: String, required: true },
    message: { type: String, required: true },
    requesterName: { type: String, required: true },
    providerName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceRequest || mongoose.model("ServiceRequest", ServiceRequestSchema);
