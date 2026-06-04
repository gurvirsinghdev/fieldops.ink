import "server-only";

export interface QBCompanyInfo {
  companyName: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  address: {
    line1: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  } | null;
}

export interface QBCustomer {
  qbId: string;
  name: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
}

function baseUrl(environment: string): string {
  return environment === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

async function qbFetch<T>(
  accessToken: string,
  realmId: string,
  path: string,
  label: string,
): Promise<T> {
  const env = process.env.QUICKBOOKS_ENVIRONMENT ?? "sandbox";
  const url = `${baseUrl(env)}/v3/company/${realmId}/${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${label} failed (${response.status})`);
  }

  return response.json();
}

export async function fetchCompanyInfo(
  accessToken: string,
  realmId: string,
): Promise<QBCompanyInfo> {
  const data = await qbFetch<{ CompanyInfo: Record<string, unknown> }>(
    accessToken,
    realmId,
    `companyinfo/${realmId}`,
    "QuickBooks CompanyInfo fetch",
  );
  const company = data.CompanyInfo;

  return {
    companyName: (company.CompanyName as string) ?? null,
    legalName: (company.LegalName as string) ?? null,
    email:
      ((company.CompanyEmailAddr as Record<string, unknown>)?.Address as string) ?? null,
    phone:
      ((company.PrimaryPhone as Record<string, unknown>)?.FreeFormNumber as string) ?? null,
    address: company.PrimaryAddr
      ? {
          line1:
            ((company.PrimaryAddr as Record<string, unknown>).Line1 as string) ?? null,
          city:
            ((company.PrimaryAddr as Record<string, unknown>).City as string) ?? null,
          province:
            ((company.PrimaryAddr as Record<string, unknown>)
              .CountrySubDivisionCode as string) ?? null,
          postalCode:
            ((company.PrimaryAddr as Record<string, unknown>).PostalCode as string) ?? null,
        }
      : null,
  };
}

export async function fetchQBCustomers(
  accessToken: string,
  realmId: string,
): Promise<QBCustomer[]> {
  const query = "select * from Customer";
  const data = await qbFetch<{
    QueryResponse: { Customer?: Record<string, unknown>[] };
  }>(
    accessToken,
    realmId,
    `query?query=${encodeURIComponent(query)}`,
    "QuickBooks Customer query",
  );

  const entities = data.QueryResponse?.Customer ?? [];

  return entities.map((c: Record<string, unknown>) => {
    const billAddr = c.BillAddr as Record<string, unknown> | undefined;
    const emailObj = c.PrimaryEmailAddr as Record<string, unknown> | undefined;
    const phoneObj = c.PrimaryPhone as Record<string, unknown> | undefined;

    return {
      qbId: (c.Id as string) ?? "",
      name: (c.DisplayName as string) ?? "",
      email: (emailObj?.Address as string) ?? null,
      phone: (phoneObj?.FreeFormNumber as string) ?? null,
      addressLine1: (billAddr?.Line1 as string) ?? null,
      city: (billAddr?.City as string) ?? null,
      province: (billAddr?.CountrySubDivisionCode as string) ?? null,
      postalCode: (billAddr?.PostalCode as string) ?? null,
      country: (billAddr?.Country as string) ?? null,
    };
  });
}

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export async function createQBCustomer(
  accessToken: string,
  realmId: string,
  input: CreateCustomerInput,
): Promise<string> {
  const env = process.env.QUICKBOOKS_ENVIRONMENT ?? "sandbox";
  const url = `${baseUrl(env)}/v3/company/${realmId}/customer`;

  const body: Record<string, unknown> = {
    DisplayName: input.name,
  };

  if (input.email) {
    body.PrimaryEmailAddr = { Address: input.email };
  }
  if (input.phone) {
    body.PrimaryPhone = { FreeFormNumber: input.phone };
  }

  const hasAddress = [
    input.addressLine1,
    input.city,
    input.province,
    input.postalCode,
    input.country,
  ].some(Boolean);

  if (hasAddress) {
    body.BillAddr = {
      Line1: input.addressLine1 ?? undefined,
      City: input.city ?? undefined,
      CountrySubDivisionCode: input.province ?? undefined,
      PostalCode: input.postalCode ?? undefined,
      Country: input.country ?? undefined,
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`QuickBooks Customer create failed (${response.status})`);
  }

  const data = await response.json();
  return data.Customer?.Id as string;
}

export async function updateQBCustomer(
  accessToken: string,
  realmId: string,
  qbId: string,
  input: CreateCustomerInput,
): Promise<void> {
  const env = process.env.QUICKBOOKS_ENVIRONMENT ?? "sandbox";
  const url = `${baseUrl(env)}/v3/company/${realmId}/customer?operation=update`;

  const body: Record<string, unknown> = {
    Id: qbId,
    DisplayName: input.name,
    sparse: true,
  };

  if (input.email) {
    body.PrimaryEmailAddr = { Address: input.email };
  }
  if (input.phone) {
    body.PrimaryPhone = { FreeFormNumber: input.phone };
  }

  const hasAddress = [
    input.addressLine1,
    input.city,
    input.province,
    input.postalCode,
    input.country,
  ].some(Boolean);

  if (hasAddress) {
    body.BillAddr = {
      Line1: input.addressLine1 ?? undefined,
      City: input.city ?? undefined,
      CountrySubDivisionCode: input.province ?? undefined,
      PostalCode: input.postalCode ?? undefined,
      Country: input.country ?? undefined,
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`QuickBooks Customer update failed (${response.status})`);
  }
}
