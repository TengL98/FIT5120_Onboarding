from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

uv_data = pd.read_csv("data/uv_recommendations.csv")


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


def get_clothing_recommendation_from_csv(category):

    row = uv_data[uv_data["uv_category"].str.contains(category, case=False)]

    if row.empty:
        return {}

    result = row.iloc[0]

    return {
        "clothing_recommendation": result["clothing_recommendation"],
        "upf_recommendation": result["upf_recommendation"],
        "authority_source": result["authority_source"]
    }


@app.route("/")
def home():
    return "Backend is running"


@app.route("/api/uv-clothing", methods=["GET"])
def uv_clothing():
    try:
        uv_index_str = request.args.get("uv_index")

        if uv_index_str is None:
            return jsonify({
                "error": "uv_index is required"
            }), 400

        uv_index = float(uv_index_str)

        if uv_index < 0:
            return jsonify({
                "error": "uv_index cannot be negative"
            }), 400

        category = get_uv_category(uv_index)

        recommendation = get_clothing_recommendation_from_csv(category)

        return jsonify({
            "uv_index": uv_index,
            "uv_category": category,
            "clothing_recommendation": recommendation.get("clothing_recommendation"),
            "upf_recommendation": recommendation.get("upf_recommendation"),
            "authority_source": recommendation.get("authority_source")
        })

    except ValueError:
        return jsonify({
            "error": "uv_index must be a number"
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    app.run(debug=True)