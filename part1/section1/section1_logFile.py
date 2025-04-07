import pandas as pd
import re
from collections import Counter
import heapq

def read_and_extract_errors(input_file):
    errors = []
    try:
        df = pd.read_excel(input_file, header=None) 
        for line in df[0].astype(str):  # read each row as text
            match = re.search(r"Error: (\S+)", line)
            if match:
                errors.append(match.group(1)) #add the rows with error
    except Exception as e:
        print(f"Error reading file: {e}")
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

def process_log_file(input_file, N):
    errors = read_and_extract_errors(input_file)
    if not errors:
        return
    chunk_count = split_log_data(errors)
    global_counter = merge_counters(chunk_count)
    top_n = heapq.nlargest(N, global_counter.items(), key=lambda x: x[1])
    for error_code, count in top_n:
        print(f'{error_code}: {count}')

if __name__ == "__main__":
    input_file = "logs.txt.xlsx" 
    N = 2 
    process_log_file(input_file, N)


# סיבוכיות הזמן : O(Mlog(N)) - 
# M - מספר השורות בקובץ
# N - מספר השגיאות המובילות שצריך להחזיר

# סיבוכיות המקום : O(M + U) - 
# M - מספר השורות בקובץ
# U - מספר סוגי השגיאות