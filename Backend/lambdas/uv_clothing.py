import json
import pymysql


def get_uv_category(uv_index):
    if uv_index <= 2:
        return "Low"
    elif uv_index <= 5:
        return "Moderate"
    elif uv_index <= 7:
        return "High"
    elif uv_index <= 10:
        return "Very High"
    else:
        return "Extreme"


def get_clothing_recommendation_from_db(category):
    connection = None
    cursor = None

    try:
        connection = pymysql.connect(
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

        cursor = connection.cursor()

        sql = """
            SELECT clothing_recommendation, upf_recommendation, authority_source
            FROM uv_recommendations
            WHERE uv_category LIKE %s
            LIMIT 1
        """
        cursor.execute(sql, (f"%{category}%",))
        result = cursor.fetchone()

        return result or {}

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        uv_index_str = query_params.get("uv_index")

        if uv_index_str is None:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "uv_index is required"})
            }

        uv_index = float(uv_index_str)

        if uv_index < 0:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "uv_index cannot be negative"})
            }

        category = get_uv_category(uv_index)
        recommendation = get_clothing_recommendation_from_db(category)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "uv_index": uv_index,
                "uv_category": category,
                "clothing_recommendation": recommendation.get("clothing_recommendation"),
                "upf_recommendation": recommendation.get("upf_recommendation"),
                "authority_source": recommendation.get("authority_source")
            })
        }

    except ValueError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "uv_index must be a number"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }