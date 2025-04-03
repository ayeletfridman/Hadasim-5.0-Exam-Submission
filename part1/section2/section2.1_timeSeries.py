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

     # Remove rows with non-numeric values in the 'value' column
    df = df[pd.to_numeric(df['value'], errors='coerce').notna()]
    
    return df

def compute_hourly_average(df):
    # Compute hourly average of 'value' column
    df['Hour'] = df['timestamp'].dt.floor('h')  # Round timestamps down to the nearest hour
    hourly_avg = df.groupby('Hour')['value'].mean().reset_index()  # Group by hour and compute average
    hourly_avg.columns = ['Timestamp', 'Average']  # Rename columns
    return hourly_avg

def save_data(df, output_file):
    # Save processed data to a CSV file
    df.to_csv(output_file, index=False)
    print(f"Processed data saved to {output_file}")

def main():
    input_file = "time_series.xlsx"  # Change according to your file name
    output_file = "hourly_average.csv"  # Output file name
    
    df = load_data(input_file)  # Load data from Excel file
    df = clean_data(df)  # Clean the data
    hourly_avg = compute_hourly_average(df)  # Compute hourly averages
    save_data(hourly_avg, output_file)  # Save results to CSV file

if __name__ == "__main__":
    main()
