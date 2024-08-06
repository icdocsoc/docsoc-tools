#!/bin/bash
# Naively runs the script every 5 mins using sleep
# Ideally, use a cron job to run the script at a specific interval

# Usage: ./run_interval.sh <script_to_run> <seconds_to_sleep>

while true; do
		$1
		sleep $2
done