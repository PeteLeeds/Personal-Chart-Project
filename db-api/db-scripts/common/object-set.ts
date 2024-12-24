export class ObjectSet<T> extends Set<T> {
    add(value: T): this {
        let found = false;
        this.forEach(item => {
            if (JSON.stringify(value) === JSON.stringify(item)) {
                found = true;
            }
        });

        if (!found) {
            super.add(value);
        }

        return this;
    }
}
