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

export interface ImportedCustomer {
  name: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
}

export async function fetchCompanyInfo(
  accessToken: string,
  realmId: string,
  environment: string = "sandbox",
): Promise<QBCompanyInfo> {
  const baseUrl =
    environment === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

  const url = `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `QuickBooks CompanyInfo fetch failed (${response.status})`,
    );
  }

  const data = await response.json();
  const company = data.CompanyInfo;

  return {
    companyName: company.CompanyName ?? null,
    legalName: company.LegalName ?? null,
    email: company.CompanyEmailAddr?.Address ?? null,
    phone: company.PrimaryPhone?.FreeFormNumber ?? null,
    address: company.PrimaryAddr
      ? {
          line1: company.PrimaryAddr.Line1 ?? null,
          city: company.PrimaryAddr.City ?? null,
          province:
            company.PrimaryAddr.CountrySubDivisionCode ?? null,
          postalCode: company.PrimaryAddr.PostalCode ?? null,
        }
      : null,
  };
}

export async function importCustomers(
  accessToken: string,
  realmId: string,
  environment: string = "sandbox",
): Promise<ImportedCustomer[]> {
  const baseUrl =
    environment === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

  const query = "select * from Customer";
  const url = `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `QuickBooks Customer query failed (${response.status})`,
    );
  }

  const data = await response.json();
  const entities = data.QueryResponse?.Customer ?? [];

  return entities.map((c: Record<string, unknown>) => {
    const billAddr = c.BillAddr as Record<string, unknown> | undefined;
    const emailObj = c.PrimaryEmailAddr as Record<string, unknown> | undefined;
    const phoneObj = c.PrimaryPhone as Record<string, unknown> | undefined;

    return {
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
