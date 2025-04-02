import pandas as pd
import re
from collections import Counter
import heapq

def read_log_file(input_file):
    try:
        df = pd.read_excel(input_file, header=None)  # read the excel file
        return df[0].astype(str).tolist()  # turn each row from the file into a list
    except Exception as e:
        print(f"Error reading file: {e}")
        return []

def extract_errors(log_lines):
    errors = []
    for line in log_lines:
        match = re.search(r"Error: (\S+)", line) #look for the code in eavh row
        if match:
            errors.append(match.group(1)) #add the error code
    return errors

def split_log_data(errors, lines_per_chunk=100000):
    chunk_count = 0
    for i in range(0, len(errors), lines_per_chunk):
        chunk_data = errors[i:i+lines_per_chunk] #take each time 100000 rows
        chunk_filename = f'chunk_{chunk_count}.txt' #create new small file
        with open(chunk_filename, 'w', encoding='utf-8') as chunk_file: #open the file for writing
            chunk_file.write('\n'.join(chunk_data) + '\n') #write the rows
        chunk_count += 1
    return chunk_count #num of files

def count_errors_in_chunk(chunk_filename):
    counter = Counter()
    with open(chunk_filename, 'r', encoding='utf-8') as file: #open the file for reading
        for line in file:
            error_code = line.strip() #without spaces
            if error_code:
                counter[error_code] += 1
    return counter

def merge_counters(chunk_count):
    global_counter = Counter()
    for i in range(chunk_count): #for each file
        chunk_filename = f'chunk_{i}.txt'
        chunk_counter = count_errors_in_chunk(chunk_filename)
        global_counter.update(chunk_counter) #merge all the errors in the split files together
    return global_counter

def get_top_n_errors(global_counter, N):
    return heapq.nlargest(N, global_counter.items(), key=lambda x: x[1]) #return the N most current errors by their bumber - x[1]

def process_log_file(input_file, N):
    log_lines = read_log_file(input_file)
    if not log_lines:
        return
    errors = extract_errors(log_lines)
    chunk_count = split_log_data(errors)
    global_counter = merge_counters(chunk_count)
    top_n_errors = get_top_n_errors(global_counter, N)
    for error_code, count in top_n_errors:
        print(f'{error_code}: {count}')

if __name__ == "__main__":
    input_file = "logs.txt.xlsx" 
    N = 2 
    process_log_file(input_file, N)
