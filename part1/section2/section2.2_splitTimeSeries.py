import pandas as pd

def load_data(file_path):
    # Load data from an Excel file and convert the timestamp column
    try:
        if not file_path.endswith('.xlsx'):
            raise ValueError("Unsupported file format. Please use .xlsx")
        
        df = pd.read_excel(file_path)  # Read data from Excel file
        df['timestamp'] = pd.to_datetime(df['timestamp'])  # Convert timestamp column to datetime format
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        exit()

def clean_data(df):
    
    # Remove duplicate rows
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        print(f"Found {duplicates} duplicate rows. Removing them...")
        df = df.drop_duplicates()
    
    # Remove missing values
    missing_values = df.isnull().sum()
    if missing_values.any():
        print("Found missing values, removing them...")
        df = df.dropna()

     # Remove rows where 'value' is not a numeric value
    df = df[pd.to_numeric(df['value'], errors='coerce').notna()]
    
    return df

def split_data_by_day(df):
    # Split data into separate files for each day
    df['Date'] = df['timestamp'].dt.date
    unique_dates = df['Date'].unique()
    for date in unique_dates:
        daily_data = df[df['Date'] == date]
        daily_data.to_csv(f"data_{date}.csv", index=False)
    return unique_dates

def compute_hourly_average(df):
    # Compute hourly average of 'value' column
    df['Hour'] = df['timestamp'].dt.floor('h')  # Round timestamps down to the nearest hour
    hourly_avg = df.groupby('Hour')['value'].mean().reset_index()  # Group by hour and compute average
    hourly_avg.columns = ['Timestamp', 'Average']  # Rename columns
    return hourly_avg

def process_daily_files(dates):
    # Compute hourly averages for each daily file and merge results
    all_data = []
    for date in dates:
        daily_df = pd.read_csv(f"data_{date}.csv")
        daily_df['timestamp'] = pd.to_datetime(daily_df['timestamp'])
        hourly_avg = compute_hourly_average(daily_df)
        all_data.append(hourly_avg)
    
    final_df = pd.concat(all_data).sort_values(by='Timestamp')
    return final_df

def save_data(df, output_file):
    # Save processed data to a CSV file
    df.to_csv(output_file, index=False)
    print(f"Processed data saved to {output_file}")

def main():
    input_file = "time_series.xlsx"  # Change according to your file name
    output_file = "split_hourly_average.csv"  # Output file name
    
    df = load_data(input_file)  # Load data from Excel file
    df = clean_data(df)  # Clean the data
    dates = split_data_by_day(df)  # Split data by day
    hourly_avg = process_daily_files(dates)  # Compute hourly averages
    save_data(hourly_avg, output_file)  # Save results to CSV file

if __name__ == "__main__":
    main()
