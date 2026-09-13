import urllib.request
import urllib.error
import json
import sys

BASE_URL = 'http://127.0.0.1:8008/api'

SELLER_TOKEN = 'jwt-seller-token'
BUYER_TOKEN = 'jwt-buyer-token'
OTHER_SELLER_TOKEN = 'demo-seller-token'  # Note: this has same id in auth_service mock, let's verify if there is an other buyer/seller or how roles work
TRANSPORTER_TOKEN = 'jwt-transporter-token'

def req(path, method='GET', data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode('utf-8') if data is not None else None
    request = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            status_code = response.status
            body = response.read().decode('utf-8')
            return status_code, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        status_code = e.code
        body = e.read().decode('utf-8')
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {'raw': body}
        return status_code, parsed

def run_all_tests():
    print("================================================================================")
    print("STEP 17: FINAL END-TO-END ACCEPTANCE SUITE — CARBONLOOP MVP")
    print("================================================================================")
    
    # -------------------------------------------------------------------------
    # TEST 1 — SELLER
    # -------------------------------------------------------------------------
    print("\n[TEST 1] SELLER WORKFLOW")
    # 1. Login through Auth
    code, me = req('/auth/me', token=SELLER_TOKEN)
    assert code == 200, f"Expected 200 for /auth/me, got {code}: {me}"
    print("  1.1 Auth: Seller profile verified:", me['email'], f"(Role: {me['role']})")
    assert me['role'] == 'SELLER', f"Expected SELLER role, got {me['role']}"

    # 2. Create a CO2 listing
    listing_data = {
        "quantity": 1000.0,
        "purity": 99.1,
        "location": "Mundra SEZ, Kutch, Gujarat",
        "asking_price": 52.0,
        "availability_start": "2026-11-01"
    }
    code, listing = req('/listings', method='POST', data=listing_data, token=SELLER_TOKEN)
    assert code == 201, f"Expected 201 for listing creation, got {code}: {listing}"
    listing_id = listing['id']
    print(f"  1.2 Create Listing: Created ID={listing_id}, Purity={listing['purity']}%, Qty={listing['quantity']}t")

    # 3. Verify it is stored and appears in marketplace
    code, all_listings = req('/listings', token=SELLER_TOKEN)
    assert code == 200, f"Expected 200 for /listings, got {code}"
    found = next((l for l in all_listings if l['id'] == listing_id), None)
    assert found is not None, "Created listing not found in marketplace!"
    print(f"  1.3 Marketplace Verification: Listing {listing_id} successfully listed.")

    # 4. Edit the listing
    update_data = {
        "asking_price": 49.5,
        "quantity": 950.0
    }
    code, updated_listing = req(f'/listings/{listing_id}', method='PATCH', data=update_data, token=SELLER_TOKEN)
    assert code == 200, f"Expected 200 for listing update, got {code}: {updated_listing}"
    assert updated_listing['asking_price'] == 49.5, f"Expected price 49.5, got {updated_listing['asking_price']}"
    assert updated_listing['quantity'] == 950.0, f"Expected quantity 950, got {updated_listing['quantity']}"
    print(f"  1.4 Edit Listing: Price updated to ${updated_listing['asking_price']}/t, Qty to {updated_listing['quantity']}t.")

    # 5. Delete/cancel the listing
    code, del_res = req(f'/listings/{listing_id}', method='DELETE', token=SELLER_TOKEN)
    assert code in (200, 204), f"Expected 200 or 204 for delete, got {code}: {del_res}"
    print(f"  1.5 Delete/Cancel Listing: Listing {listing_id} deleted/cancelled.")

    # Re-create an active listing for matchmaking tests
    code, active_listing = req('/listings', method='POST', data=listing_data, token=SELLER_TOKEN)
    assert code == 201
    active_listing_id = active_listing['id']
    print(f"  1.6 Active Listing Ready for Matching: ID={active_listing_id}")

    # -------------------------------------------------------------------------
    # TEST 2 — BUYER
    # -------------------------------------------------------------------------
    print("\n[TEST 2] BUYER WORKFLOW")
    # 1. Login & Profile
    code, buyer_me = req('/auth/me', token=BUYER_TOKEN)
    assert code == 200, f"Expected 200 for buyer /auth/me, got {code}"
    assert buyer_me['role'] == 'BUYER', f"Expected BUYER role, got {buyer_me['role']}"
    print("  2.1 Auth: Buyer profile verified:", buyer_me['email'], f"(Role: {buyer_me['role']})")

    # 2. Create Requirement
    req_data = {
        "required_quantity": 400.0,
        "min_purity": 96.0,
        "delivery_location": "Dahej PCPIR, Bharuch, Gujarat",
        "max_budget": 60.0,
        "required_date": "2026-11-15"
    }
    code, req_obj = req('/requirements', method='POST', data=req_data, token=BUYER_TOKEN)
    assert code == 201, f"Expected 201 for requirement, got {code}: {req_obj}"
    requirement_id = req_obj['id']
    print(f"  2.2 Create Requirement: ID={requirement_id}, Target={req_obj['delivery_location']}, Needed={req_obj['required_quantity']}t")

    # 3. Request matches
    code, match_resp = req(f'/matches/{requirement_id}', token=BUYER_TOKEN)
    assert code == 200, f"Expected 200 for matches, got {code}: {match_resp}"
    matches = match_resp.get('matches', [])
    assert len(matches) > 0, "No matches returned for requirement!"
    top_match = matches[0]
    print(f"  2.3 Matches Retrieved: {len(matches)} ranked candidate(s) found.")

    # 4. Verify match scores, explanation, quantity/purity compatibility, logistics & cost
    print(f"  2.4 Match Score: {top_match['match_score']} / 100")
    assert 0 <= top_match['match_score'] <= 100, "Match score out of range"
    print(f"  2.5 Purity Compatibility: Assayed {top_match['listing']['purity']}% vs Required {req_obj['min_purity']}% (Score: {top_match['purity_score']})")
    assert top_match['listing']['purity'] >= req_obj['min_purity'], "Incompatible purity accepted"
    print(f"  2.6 Quantity Fit: Available {top_match['listing']['quantity']}t vs Needed {req_obj['required_quantity']}t (Score: {top_match['quantity_score']})")
    print(f"  2.7 Logistics & Distance: {top_match['distance_km']} km route")
    logistics = top_match.get('logistics', {})
    assert logistics, "Missing logistics estimation"
    print(f"      - Cryo-Tanker Trips: {logistics.get('trips_required')}")
    print(f"      - Freight Cost: ${logistics.get('transport_estimated_cost')}")
    print(f"      - Total Estimated Cost: ${logistics.get('total_estimated_cost')}")
    print(f"  2.8 Explanation: \"{top_match['explanation'][:90]}...\"")
    match_id = top_match['id']

    # -------------------------------------------------------------------------
    # TEST 3 — REQUEST / BIDDING
    # -------------------------------------------------------------------------
    print("\n[TEST 3] SUPPLY REQUEST & BIDDING WORKFLOW")
    # 1. Buyer creates request
    bid_payload = {
        "match_id": match_id,
        "quantity": 300.0,
        "offered_price": 50.0
    }
    code, supply_req = req('/requests', method='POST', data=bid_payload, token=BUYER_TOKEN)
    assert code == 201, f"Expected 201 for request creation, got {code}: {supply_req}"
    request_id = supply_req['id']
    assert supply_req['status'] == 'PENDING', f"Expected PENDING status, got {supply_req['status']}"
    print(f"  3.1 Buyer Created Request: ID={request_id}, Qty={supply_req['quantity']}t, Price=${supply_req['offered_price']}/t, Status={supply_req['status']}")

    # 2. Seller receives request
    code, seller_requests = req('/requests', token=SELLER_TOKEN)
    assert code == 200
    matched_req = next((r for r in seller_requests if r['id'] == request_id), None)
    assert matched_req is not None, "Request not received by seller!"
    print(f"  3.2 Seller Received Request: ID={matched_req['id']}, Status={matched_req['status']}")

    # 3. Seller accepts the request
    code, accepted_req = req(f'/requests/{request_id}/status', method='PATCH', data={"status": "ACCEPTED"}, token=SELLER_TOKEN)
    assert code == 200, f"Expected 200 for accept, got {code}: {accepted_req}"
    assert accepted_req['status'] == 'ACCEPTED', f"Expected ACCEPTED status, got {accepted_req['status']}"
    print(f"  3.3 Seller Accepted Request: Status is now {accepted_req['status']}")

    # -------------------------------------------------------------------------
    # TEST 4 — TRANSPORT OPERATIONS
    # -------------------------------------------------------------------------
    print("\n[TEST 4] TRANSPORT OPERATIONS & TRACKING")
    # 1. Create or retrieve transport job
    code, jobs = req('/transport/jobs', token=TRANSPORTER_TOKEN)
    assert code == 200
    job = next((j for j in jobs if j['request_id'] == request_id), None)
    if not job:
        job_payload = {
            "request_id": request_id,
            "transporter_id": "33333333-3333-4333-8333-333333333333",
            "pickup_location": active_listing['location'],
            "delivery_location": req_obj['delivery_location'],
            "distance_km": top_match['distance_km'],
            "estimated_cost": logistics['transport_estimated_cost'],
            "status": "ASSIGNED"
        }
        code, job = req('/transport/jobs', method='POST', data=job_payload, token=TRANSPORTER_TOKEN)
        assert code == 201, f"Expected 201 for transport job creation, got {code}: {job}"

    job_id = job['id']
    print(f"  4.1 Transport Job Commissioned: ID={job_id}")
    print(f"      - Pickup: {job['pickup_location']}")
    print(f"      - Delivery: {job['delivery_location']}")
    print(f"      - Distance: {job['distance_km']} km")
    print(f"      - Estimated Freight Cost: ${job['estimated_cost']}")
    assert job['pickup_location'] == top_match['listing']['location']
    assert job['delivery_location'] == req_obj['delivery_location']

    # 2. Update transport status to IN_TRANSIT
    code, transit_job = req(f'/transport/jobs/{job_id}/status', method='PATCH', data={"status": "IN_TRANSIT"}, token=TRANSPORTER_TOKEN)
    assert code == 200, f"Expected 200 for IN_TRANSIT, got {code}: {transit_job}"
    assert transit_job['status'] == 'IN_TRANSIT'
    print(f"  4.2 Status Updated to IN_TRANSIT: Status={transit_job['status']}")

    # 3. Update transport status to DELIVERED
    code, delivered_job = req(f'/transport/jobs/{job_id}/status', method='PATCH', data={"status": "DELIVERED"}, token=TRANSPORTER_TOKEN)
    assert code == 200, f"Expected 200 for DELIVERED, got {code}: {delivered_job}"
    assert delivered_job['status'] == 'DELIVERED'
    print(f"  4.3 Status Updated to DELIVERED: Status={delivered_job['status']}")

    # 4. Verify buyer/seller can see the appropriate status
    code, seller_view_job = req(f'/transport/jobs/{job_id}', token=SELLER_TOKEN)
    assert code == 200, f"Expected seller to be able to view transport job, got {code}"
    assert seller_view_job['status'] == 'DELIVERED'
    code, buyer_view_job = req(f'/transport/jobs/{job_id}', token=BUYER_TOKEN)
    assert code == 200, f"Expected buyer to be able to view transport job, got {code}"
    assert buyer_view_job['status'] == 'DELIVERED'
    print("  4.4 Visibility: Both Seller and Buyer successfully verified the final DELIVERED status.")

    # -------------------------------------------------------------------------
    # SECURITY TESTS
    # -------------------------------------------------------------------------
    print("\n[SECURITY TESTS] ACCESS CONTROL & AUTHORIZATION")
    BUYER_2_TOKEN = 'jwt-buyer-2-token'
    SELLER_2_TOKEN = 'jwt-seller-2-token'

    # 1. Unauthenticated users cannot access protected endpoints
    code, resp = req('/listings', method='POST', data=listing_data, token=None)
    assert code in (401, 403), f"Expected 401/403 for unauthenticated POST /listings, got {code}"
    code, resp = req('/requirements', method='POST', data=req_data, token=None)
    assert code in (401, 403), f"Expected 401/403 for unauthenticated POST /requirements, got {code}"
    code, resp = req('/requests', method='POST', data=bid_payload, token=None)
    assert code in (401, 403), f"Expected 401/403 for unauthenticated POST /requests, got {code}"
    print("  S.1 Unauthenticated access blocked on protected endpoints (HTTP 401/403)")

    # 2. Buyers cannot modify another buyer's requirements
    code, resp = req(f'/requirements/{requirement_id}', method='PATCH', data={"max_budget": 99.0}, token=BUYER_2_TOKEN)
    assert code == 403, f"Expected 403 for buyer 2 modifying buyer 1's requirement, got {code}: {resp}"
    print(f"  S.2 Buyers cannot modify another buyer's requirements (HTTP {code})")

    # 3. Sellers cannot modify another seller's listings
    code, resp = req(f'/listings/{active_listing_id}', method='PATCH', data={"asking_price": 10.0}, token=SELLER_2_TOKEN)
    assert code == 403, f"Expected 403 for seller 2 modifying seller 1's listing, got {code}: {resp}"
    print(f"  S.3 Sellers cannot modify another seller's listings (HTTP {code})")

    # 4. Buyers cannot accept seller requests
    code, resp = req(f'/requests/{request_id}/status', method='PATCH', data={"status": "ACCEPTED"}, token=BUYER_TOKEN)
    assert code == 403, f"Expected 403 for buyer attempting to accept own request, got {code}"
    print(f"  S.4 Buyers cannot accept seller requests (HTTP {code})")

    # 5. Sellers cannot modify another seller's requests
    code, resp = req(f'/requests/{request_id}/status', method='PATCH', data={"status": "ACCEPTED"}, token=SELLER_2_TOKEN)
    assert code == 403, f"Expected 403 for seller 2 modifying seller 1's incoming request, got {code}: {resp}"
    print(f"  S.5 Sellers cannot modify another seller's requests (HTTP {code})")

    # 6. Transporters cannot access unrelated private data
    code, resp = req('/requests', token=TRANSPORTER_TOKEN)
    assert code == 403, f"Expected 403 for transporter accessing private commercial requests, got {code}: {resp}"
    print(f"  S.6 Transporters restricted from unrelated private commercial data (HTTP {code})")


    # -------------------------------------------------------------------------
    # ERROR & VALIDATION TESTS
    # -------------------------------------------------------------------------
    print("\n[ERROR & VALIDATION TESTS]")
    # 1. Invalid quantity (negative or zero)
    code, resp = req('/listings', method='POST', data={"quantity": -50.0, "purity": 99.0, "location": "Test", "asking_price": 50.0}, token=SELLER_TOKEN)
    assert code == 422, f"Expected 422 for negative quantity, got {code}"
    print("  E.1 Invalid Quantity: Correctly rejected with HTTP 422")

    # 2. Invalid purity (> 100% or negative)
    code, resp = req('/listings', method='POST', data={"quantity": 100.0, "purity": 105.0, "location": "Test", "asking_price": 50.0}, token=SELLER_TOKEN)
    assert code == 422, f"Expected 422 for purity > 100%, got {code}"
    print("  E.2 Invalid Purity: Correctly rejected with HTTP 422")

    # 3. Invalid price (< 0)
    code, resp = req('/listings', method='POST', data={"quantity": 100.0, "purity": 98.0, "location": "Test", "asking_price": -10.0}, token=SELLER_TOKEN)
    assert code == 422, f"Expected 422 for negative price, got {code}"
    print("  E.3 Invalid Price: Correctly rejected with HTTP 422")

    # 4. Missing required fields
    code, resp = req('/listings', method='POST', data={"quantity": 100.0}, token=SELLER_TOKEN)
    assert code == 422, f"Expected 422 for missing fields, got {code}"
    print("  E.4 Missing Required Fields: Correctly rejected with HTTP 422")

    # 5. Invalid / Nonexistent IDs
    code, resp = req('/listings/00000000-0000-0000-0000-000000000000', token=SELLER_TOKEN)
    assert code == 404, f"Expected 404 for nonexistent listing, got {code}"
    print("  E.5 Nonexistent Record: Correctly returned HTTP 404")

    # 6. Malformed ID format
    code, resp = req('/listings/invalid-non-uuid-string', token=SELLER_TOKEN)
    assert code in (400, 404, 422), f"Expected 400/404/422 for malformed UUID, got {code}"
    print(f"  E.6 Malformed ID: Handled safely (HTTP {code})")

    print("\n================================================================================")
    print("ALL STEP 17 TEST SUITES (SELLER, BUYER, REQUEST, TRANSPORT, SECURITY, ERRORS) PASSED 100%!")
    print("================================================================================")

if __name__ == '__main__':
    run_all_tests()
