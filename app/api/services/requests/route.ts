import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession, requireAuth } from "@/lib/auth/session";
import { sanitizeInput, isValidKenyanPhone } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");

    let requests = serverDB.getServiceRequests();

    if (isAuthenticated && user) {
      if (user.role === "SERVICE_PROVIDER" || user.role === "SELLER" || user.role === "BUSINESS_OWNER") {
        const pId = user.businessId || user.businessSlug || user.id;
        requests = serverDB.getServiceRequests({ providerId: pId });
      } else if (user.role === "CUSTOMER") {
        requests = serverDB.getServiceRequests({ customerId: user.id });
      }
    } else if (providerId) {
      requests = serverDB.getServiceRequests({ providerId });
    }

    return NextResponse.json({ success: true, serviceRequests: requests });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch service requests." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const body = await req.json();

    const serviceId = sanitizeInput(body.serviceId || "", 50);
    const serviceTitle = sanitizeInput(body.serviceTitle || "Requested Service", 100);
    const providerId = sanitizeInput(body.providerId || "prov-1", 50);
    const providerName = sanitizeInput(body.providerName || "Service Professional", 80);
    const customerName = sanitizeInput(body.customerName || user?.name || "Customer", 80);
    const customerPhone = sanitizeInput(body.customerPhone || user?.phone || "", 20);
    const customerEmail = sanitizeInput(body.customerEmail || user?.email || "", 100);
    const county = sanitizeInput(body.county || "Nairobi", 40);
    const town = sanitizeInput(body.town || "Central", 40);
    const requestType = body.requestType === "quote" ? "quote" : "book";
    const scheduledDate = body.scheduledDate ? sanitizeInput(body.scheduledDate, 30) : undefined;
    const notes = sanitizeInput(body.notes || "", 500);

    if (!isValidKenyanPhone(customerPhone)) {
      return NextResponse.json(
        { success: false, error: "Valid Kenyan mobile number is required to receive appointment confirmation." },
        { status: 400 }
      );
    }

    if (!notes || notes.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please describe the scope of work or problem." },
        { status: 400 }
      );
    }

    const newRequest = serverDB.createServiceRequest({
      serviceId,
      serviceTitle,
      providerId,
      providerName,
      customerId: user?.id || `guest-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail,
      county,
      town,
      requestType,
      scheduledDate,
      notes,
      status: "PENDING",
    });

    // Notify provider
    serverDB.addNotification({
      userId: providerId,
      title: `New Service ${requestType === "book" ? "Booking" : "Quote Request"}`,
      message: `${customerName} requested ${serviceTitle} in ${town}, ${county}. Contact: ${customerPhone}.`,
      type: "ORDER",
      link: `/services`,
    });

    serverDB.logAction({
      userId: user?.id,
      userRole: user?.role,
      action: "SERVICE_REQUEST_SUBMITTED",
      resource: "SERVICE",
      resourceId: newRequest.id,
      details: `${customerName} submitted ${requestType} for ${serviceTitle}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Service request submitted successfully. The provider will contact you shortly.",
      serviceRequest: newRequest,
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Service Request Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to submit service request." }, { status: 500 });
  }
}
