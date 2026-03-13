import json
import pymysql


def get_db_connection():
    return pymysql.connect(
        host="tp16.cf8wwyqkgyxb.ap-southeast-2.rds.amazonaws.com",
        user="TP16",
        password="TP16admin",
        database="TP16",
        port=3306,
        connect_timeout=5,
        read_timeout=5,
        write_timeout=5,
        cursorclass=pymysql.cursors.DictCursor
    )


def get_skin_cancer_data():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            SELECT `Year`, `cancer_type`, `female_rate`, `male_rate`, `person_rate`
            FROM skin_cancer_incidence_processed
            WHERE `Year` >= 2001
              AND `cancer_type` IN ('MSC', 'NMSC')
            ORDER BY `Year`, `cancer_type`;
        """
        cursor.execute(sql)
        rows = cursor.fetchall()

        msc_data = {
            "years": [],
            "female_rate": [],
            "male_rate": [],
            "person_rate": []
        }

        nmsc_data = {
            "years": [],
            "female_rate": [],
            "male_rate": [],
            "person_rate": []
        }

        for row in rows:
            target = msc_data if row["cancer_type"] == "MSC" else nmsc_data

            target["years"].append(int(row["Year"]))
            target["female_rate"].append(float(row["female_rate"]))
            target["male_rate"].append(float(row["male_rate"]))
            target["person_rate"].append(float(row["person_rate"]))

        return {
            "MSC": msc_data,
            "NMSC": nmsc_data
        }

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_uv_trend_data():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            SELECT `year_month`, `uv_index_monthly_mean`
            FROM melbourne_uv_monthly
            ORDER BY `year_month`;
        """
        cursor.execute(sql)
        rows = cursor.fetchall()

        return {
            "year_month": [row["year_month"] for row in rows],
            "uv_index": [int(round(float(row["uv_index_monthly_mean"]))) for row in rows]
        }

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_temperature_trend_data():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            SELECT `year_month`, `temp_monthly_mean`
            FROM melbourne_temperature_monthly
            ORDER BY `year_month`;
        """
        cursor.execute(sql)
        rows = cursor.fetchall()

        return {
            "year_month": [row["year_month"] for row in rows],
            "temperature": [int(round(float(row["temp_monthly_mean"]))) for row in rows]
        }

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def lambda_handler(event, context):
    try:
        skin_cancer_data = get_skin_cancer_data()
        uv_trend_data = get_uv_trend_data()
        temperature_trend_data = get_temperature_trend_data()

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "skinCancerImpact": skin_cancer_data,
                "uvTrend": uv_trend_data,
                "temperatureTrend": temperature_trend_data
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }