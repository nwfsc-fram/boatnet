
<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
.centered-page-item {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  letter-spacing: .5px;
}

.q-table th {
    color: #1675d1 !important;
    font-weight: bold !important;
    font-size: 14px !important;
}

.q-table__title {
  font-weight: bold !important;
}

.trip-card {
  margin: 10px;
}

.trip-date {
  width: auto !important;
}

@media screen and ( min-width: 500px) {
  .centered-page-item {
    text-align: left;
    margin-left: 20px;
  }
}

@media screen and ( max-width: 450px) {
  .trip-card {
    margin: 10px 0;
  }
}

@media screen and ( min-width: 450px) {
  .trip-date {
    width: 450px !important;
  }
}


</style>
