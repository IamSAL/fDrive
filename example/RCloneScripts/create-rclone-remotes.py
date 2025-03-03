import csv
import subprocess

# Path to the CSV file containing Mega account details
csv_file_path = 'accounts.csv'

# Read the Mega account details from the CSV file
mega_accounts = []
with open(csv_file_path, mode='r', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        # Take the first three columns: email, password, username
        if len(row) >= 3:
            email, password, username = row[:3]  # Get only the first three items
            mega_accounts.append((email, password, username))
        else:
            print(f"Skipping invalid row: {row}")

# Create remotes using the rclone command-line interface
for email, password, username in mega_accounts:
    remote_config_command = [
        "rclone", "config", "create", f"mega_{username}", "mega",
        "user", email, "pass", password
    ]
    
    try:
        # Execute the command
        subprocess.run(remote_config_command, check=True)
        print(f"Remote 'mega_{username}' created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error creating remote 'mega_{username}': {e}")

print("All remotes have been processed.")