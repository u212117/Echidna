export default async function handler(req, res) {
  const apiKey =
    "patKneYVTc1kgK62M.ef630a583b91d3cef7cd2a20fccf323737cfcd9f5a28efb62f97446540fe01af";

  const baseId = "appgU05xQa89DBYnO";
  const tableId = "tbl6QixaZGZbJQI8x";

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return res
        .status(500)
        .json({ success: false, error: "Airtable fetch failed" });
    }

    const data = await response.json();

    const records = data.records.map((r) => ({
      id: r.id,
      message: r.fields.Message || "",
    }));

    return res.status(200).json({
      success: true,
      total: records.length,
      messages: records,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.toString(),
    });
  }
}
