# Trips

Trips Vue Display a selectable list of WCGOP Trips, the trips are loaded from PouchDB and are fully reactive<br><br> State: alert, tripsState, pouchState<br> Action: clear, error, setCurrentTrip<br> Getter: currentTrip, addTest

## Methods

<!-- @vuese:Trips:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|formatDate|Simple date formatter using the moment lib|date: date string<br> cats: a cat|
|handleGoToHauls|Navigate to a selected Haul (boatnet-summary)|-|
|handleSelectTrip|boatnet-table handler for when a trip is selected|trip: a trip, type any|
|handleAddTrip|boatnet-summary override: handle add trip + navigation to Trip Details|-|
|handleEditTrip|boatnet-summary override: handle edit trip + navigation to Trip Details|-|
|handleEndTrip|boatnet-summary override: TODO handle end trip|-|
|handleDeleteTrip|boatnet-summary override: handle trip deletion (removes from PouchDB and reactively updates the boatnet-table) Clears currently selected trip|-|
|userDBTrips|boatnet-table: data for table (wrap pouchdb if available)|-|
|currentReadonlyDB|Get name of read-only (Lookups) database from PouchDB - usually lookups-dev|-|
|currentUserDB|Get name of user database from PouchDB - usually userdb-xyz with base64 encoded username|-|
|lookupsDB|Get handle to currently selected database for pouch-vue to work correctly|-|

<!-- @vuese:Trips:methods:end -->


