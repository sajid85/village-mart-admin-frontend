export const formatDate = (date: string | Date): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toFixed(2);
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "0.0%";
  return `${(value * 100).toFixed(1)}%`;
};

export const getStatusColor = (status: string): string => {
  const colors = {
    pending: "yellow",
    processing: "blue",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
    refunded: "gray",
  } as const;
  return colors[status?.toLowerCase() as keyof typeof colors] || "gray";
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
