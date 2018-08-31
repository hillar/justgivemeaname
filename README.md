# justgivemeaname

impatient? copy it, give it a name and start coding

```shell
wget https://github.com/hillar/justgivemeaname/archive/master.tar.gz
tar -xzf master.tar.gz
mv justgivemeaname-master bestnameforyourserver
cd bestnameforyourserver
more README
make install
make dev
open http://localhost:4242
```

----

`justgivemeaname` is a broiler you need to give a name and feed it to grow into server with: 
* rest endpoints serving functions 
* SPA's using those endpoints

`justgivemeaname` is not yet another framework and it is not complete. It has ready **authentication** and **logging**, so you can start coding without worring about [1](http://pcidsscompliance.net/pci-dss-requirements/how-to-comply-to-requirement-10-of-pci-dss/),[2](https://www.ria.ee/en/iske-en.html), [3](https://www.bsi.bund.de/DE/Themen/ITGrundschutz/itgrundschutz_node.html), [4](https://edps.europa.eu/sites/edp/files/publication/it_governance_management_en.pdf),...
It does not extend or replace NodeJS `req` and `res` objects. 
Yes, it today ( Aug 31 2018 ) needs `--experimental-modules`
And yes, it has some `Web Components`, so you need read [about](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
To start, read the [docs](/dev/docs/README.md)




