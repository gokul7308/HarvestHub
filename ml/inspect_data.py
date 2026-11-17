import pandas as pd

df = pd.read_csv('data/2026.csv')

print("--- PHASE A INSPECTION ---")
print(f"Row count: {len(df)}")
print(f"Columns: {list(df.columns)}")
print("\nDtypes:")
print(df.dtypes)
print("\nMissing Values:")
print(df.isnull().sum())
print(f"\nDuplicate count: {df.duplicated().sum()}")

if 'Arrival_Date' in df.columns:
    df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'], dayfirst=True)
    print(f"\nDate range: {df['Arrival_Date'].min().date()} to {df['Arrival_Date'].max().date()}")
    print(f"Unique days: {df['Arrival_Date'].nunique()}")

if 'Commodity' in df.columns:
    print(f"\nNumber of Commodities (Crops): {df['Commodity'].nunique()}")
    print("Top Commodities by row count:")
    print(df['Commodity'].value_counts().head(5))

if 'Market' in df.columns:
    print(f"\nNumber of Markets: {df['Market'].nunique()}")

print("\nBasic Price Statistics (Modal_Price):")
if 'Modal_Price' in df.columns:
    print(df['Modal_Price'].describe())
