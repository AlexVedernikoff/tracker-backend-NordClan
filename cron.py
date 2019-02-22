#!/usr/bin/env python3

import os
import sys
import time
import schedule
import subprocess


def run_calculate_metrics():
    print(subprocess.check_output(
        ['node', 'agent.js'],
        stderr=subprocess.STDOUT))


def run_ps_sync():
    print(subprocess.check_output(
        ['node', 'sync/users/index.js'],
        stderr=subprocess.STDOUT))


def run_create_draft_ts():
    print(subprocess.check_output(
        ['node', 'cronjobs/createDrafts/index.js'],
        stderr=subprocess.STDOUT))


def run_del_draft_ts():
    print(subprocess.check_output(
        ['node', 'cronjobs/deleteDrafts.js'],
        stderr=subprocess.STDOUT))


def tasks_for_dev():
    schedule.every(12).hours.do(run_ps_sync)
    schedule.every().day.at("00:00").do(run_calculate_metrics)
    schedule.every().day.at("00:30").do(run_del_draft_ts)
    schedule.every().day.at("01:00").do(run_create_draft_ts)


def tasks_for_prod():
    schedule.every(3).hours.do(run_ps_sync)
    schedule.every().day.at("00:00").do(run_calculate_metrics)
    schedule.every().day.at("00:30").do(run_del_draft_ts)
    schedule.every().day.at("01:00").do(run_create_draft_ts)


if __name__ == '__main__':
    if 'ENV_NAME' in os.environ:
        env_name = os.getenv('ENV_NAME')
    else:
        sys.exit("Environment variable ENV_NAME must be specified. Exiting.")

    if env_name.lower() == "dev" or env_name.lower() == "test":
        tasks_for_dev()

    if env_name.lower() == "prod":
        tasks_for_prod()

    while True:
        schedule.run_pending()
        time.sleep(1)
