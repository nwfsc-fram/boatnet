
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

@media screen and ( min-width: 500px) {
  .centered-page-item {
    text-align: left;
    margin-left: 20px;
  }
}

.q-table th {
    color: #1675d1 !important;
    font-weight: bold !important;
    font-size: 14px !important;
}

.q-table__title {
  font-weight: bold !important;
}

</style>
