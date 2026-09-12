import urllib.request
import json
import sys

base_url = 'http://127.0.0.1:8008/api'

seller_headers = {'Authorization': 'Bearer jwt-seller-token', 'Content-Type': 'application/json'}
buyer_headers = {'Authorization': 'Bearer jwt-buyer-token', 'Content-Type': 'application/json'}
transporter_headers = {'Authorization': 'Bearer jwt-transporter-token', 'Content-Type': 'application/json'}

def req(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    request = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"HTTP Error {e.code} for {method} {url}: {error_body}")
        raise

print('=== 1. SELLER JOURNEY: CREATE LISTING ===')
listing_payload = {
    'quantity': 650.0,
    'purity': 98.2,
    'location': 'Hazira, Surat, Gujarat',
    'asking_price': 44.5,
    'availability_start': '2026-10-01'
}
status, listing = req(f'{base_url}/listings', 'POST', listing_payload, seller_headers)
print(f"Listing created: ID={listing['id']}, purity={listing['purity']}%, qty={listing['quantity']}t")

status, all_listings = req(f'{base_url}/listings', 'GET', None, seller_headers)
matched_listing = next((l for l in all_listings if l['id'] == listing['id']), None)
assert matched_listing is not None, 'Created listing not found in marketplace'
print(f"Listing verified in Marketplace: {matched_listing['location']}")

print('\n=== 2. BUYER JOURNEY: CREATE REQUIREMENT & FIND MATCHES ===')
req_payload = {
    'required_quantity': 500.0,
    'min_purity': 95.0,
    'delivery_location': 'Dahej PCPIR, Gujarat',
    'max_budget': 50.0,
    'required_date': '2026-10-15'
}
status, requirement = req(f'{base_url}/requirements', 'POST', req_payload, buyer_headers)
print(f"Requirement created: ID={requirement['id']}, delivery_location={requirement['delivery_location']}")

status, matches_resp = req(f'{base_url}/matches/{requirement["id"]}', 'GET', None, buyer_headers)
matches = matches_resp['matches'] if isinstance(matches_resp, dict) and 'matches' in matches_resp else matches_resp
print(f"Retrieved {len(matches)} ranked matches from matchmaking engine.")
top_match = matches[0]
print(f"Top match ID: {top_match['id']}")
print(f"  Match Score: {top_match['match_score']}")
print(f"  Purity Score: {top_match['purity_score']}")
print(f"  Distance: {top_match['distance_km']} km")
if top_match.get('logistics'):
    print(f"  Logistics Total Cost: ${top_match['logistics']['total_estimated_cost']}")
    print(f"  Logistics Trips: {top_match['logistics']['trips_required']} trips")
print(f"  Explanation: {top_match['explanation'][:100]}...")

print('\n=== 3. BUYER JOURNEY: CREATE SUPPLY REQUEST ===')
supply_req_payload = {
    'match_id': top_match['id'],
    'quantity': 350.0,
    'offered_price': 44.0
}
status, supply_req = req(f'{base_url}/requests', 'POST', supply_req_payload, buyer_headers)
print(f"Supply request submitted: ID={supply_req['id']}, Status={supply_req['status']}, Offered=${supply_req['offered_price']}/t")

print('\n=== 4. SELLER JOURNEY: VIEW AND ACCEPT REQUEST ===')
status, seller_requests = req(f'{base_url}/requests', 'GET', None, seller_headers)
target_req = next((r for r in seller_requests if r['id'] == supply_req['id']), None)
assert target_req is not None, 'Supply request not visible to seller'
print(f"Seller received request: ID={target_req['id']}, Status={target_req['status']}")

status, updated_req = req(f'{base_url}/requests/{supply_req["id"]}/status', 'PATCH', {'status': 'ACCEPTED'}, seller_headers)
print(f"Seller updated request status to: {updated_req['status']}")

print('\n=== 5. TRANSPORTER JOURNEY: RETRIEVE JOB & UPDATE STATUS ===')
status, jobs = req(f'{base_url}/transport/jobs', 'GET', None, transporter_headers)
rel_job = next((j for j in jobs if j['request_id'] == supply_req['id']), None)
if not rel_job:
    job_payload = {
        'request_id': supply_req['id'],
        'transporter_id': '33333333-3333-4333-8333-333333333333',
        'pickup_location': listing['location'],
        'delivery_location': requirement['delivery_location'],
        'distance_km': top_match['distance_km'],
        'estimated_cost': top_match['logistics']['transport_estimated_cost'] if top_match.get('logistics') else 5000.0,
        'status': 'ASSIGNED'
    }
    status, rel_job = req(f'{base_url}/transport/jobs', 'POST', job_payload, transporter_headers)

print(f"Transport Job: ID={rel_job['id']}, Status={rel_job['status']}")
print(f"  Pickup: {rel_job['pickup_location']}")
print(f"  Delivery: {rel_job['delivery_location']}")
print(f"  Freight Cost: ${rel_job['estimated_cost']}")

status, in_transit_job = req(f'{base_url}/transport/jobs/{rel_job["id"]}/status', 'PATCH', {'status': 'IN_TRANSIT'}, transporter_headers)
print(f"Transport status updated to: {in_transit_job['status']}")

status, delivered_job = req(f'{base_url}/transport/jobs/{rel_job["id"]}/status', 'PATCH', {'status': 'DELIVERED'}, transporter_headers)
print(f"Transport status updated to: {delivered_job['status']}")

print('\nALL USER JOURNEYS PASSED SUCCESSFULLY 100%!')
