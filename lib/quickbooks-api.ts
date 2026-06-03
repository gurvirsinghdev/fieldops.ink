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
    country: string | null;
  } | null;
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
          country: company.PrimaryAddr.Country ?? null,
        }
      : null,
  };
}
