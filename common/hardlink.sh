#!/usr/bin/env sh
for file in types/*.ts; do
	rm ../client/src/$file
	rm ../server/src/$file
	ln $file ../client/src/$file
	ln $file ../server/src/$file
done
