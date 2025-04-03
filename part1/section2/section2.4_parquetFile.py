import pandas as pd

def load_data(file_path):
    """Load data from a Parquet file and convert the timestamp column"""
    try:
        if not file_path.endswith('.parquet'):
            raise ValueError("Unsupported file format. Please use .parquet")
        
        df = pd.read_parquet(file_path)  # Read data from Parquet file
        df['timestamp'] = pd.to_datetime(df['timestamp'])  # Convert timestamp column to datetime format

        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        exit()

def clean_data(df):
    """Clean data: remove duplicates, missing values, and non-numeric entries in the 'value' column"""
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
    df = df[pd.to_numeric(df['mean_value'], errors='coerce').notna()]
    
    return df

def compute_hourly_average(df):
    """Compute hourly average of 'value' column"""
    df['Hour'] = df['timestamp'].dt.floor('h')  # Round timestamps down to the nearest hour
    hourly_avg = df.groupby('Hour')['mean_value'].mean().reset_index()  # Group by hour and compute average
    hourly_avg.columns = ['Timestamp', 'Average']  # Rename columns
    return hourly_avg

def save_data(df, output_file):
    """Save processed data to a Parquet file"""
    df.to_parquet(output_file, index=False)  # Save to Parquet format
    print(f"Processed data saved to {output_file}")

def main():
    input_file = "time_series.parquet"  # Change according to your file name
    output_file = "hourly_average.parquet"  # Output file name
    
    df = load_data(input_file)  # Load data from Parquet file
    df = clean_data(df)  # Clean the data
    hourly_avg = compute_hourly_average(df)  # Compute hourly averages
    save_data(hourly_avg, output_file)  # Save results to Parquet file

if __name__ == "__main__":
    main()
