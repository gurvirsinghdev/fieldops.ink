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

export async function importCustomers(
  accessToken: string,
  realmId: string,
): Promise<ImportedCustomer[]> {
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
